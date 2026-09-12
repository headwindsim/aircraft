#Requires -Version 7.2
<#
Docker Desktop 4.75 on Windows build 26200 can leave inaccessible AF_UNIX
socket files even after a graceful shutdown. This launcher preserves their
runtime directories before starting a fully stopped Desktop. It never stops
Docker, deletes files, changes settings, or replaces an already running engine.
Upstream report: https://github.com/docker/desktop-feedback/issues/460
#>
[CmdletBinding(SupportsShouldProcess)]
param()
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$docker = (Get-Command docker -ErrorAction Stop).Source

function Invoke-DockerProbe([string[]]$Arguments, [int]$TimeoutSeconds) {
    $info = [Diagnostics.ProcessStartInfo]::new($docker)
    $info.UseShellExecute = $false
    $info.CreateNoWindow = $true
    $info.RedirectStandardOutput = $true
    $info.RedirectStandardError = $true
    foreach ($argument in $Arguments) { $info.ArgumentList.Add($argument) }
    $process = [Diagnostics.Process]::new()
    $process.StartInfo = $info
    try {
        $null = $process.Start()
        $stdout = $process.StandardOutput.ReadToEndAsync()
        $stderr = $process.StandardError.ReadToEndAsync()
        if (-not $process.WaitForExit($TimeoutSeconds * 1000)) {
            # Only terminate this helper's timed-out CLI probe, never Docker Desktop.
            $process.Kill()
            $process.WaitForExit()
            return @{ code = 124; output = 'Docker CLI timed out.' }
        }
        return @{ code = $process.ExitCode; output = ($stdout.GetAwaiter().GetResult() + $stderr.GetAwaiter().GetResult()).Trim() }
    } finally { $process.Dispose() }
}

$state = Invoke-DockerProbe @('info', '--format', '{{.ServerVersion}} {{.ContainersRunning}}') 5
if ($state.code -eq 0) { Write-Output "Docker is already healthy (version, running containers): $($state.output)"; return }
if (Get-Process -Name 'Docker Desktop', 'com.docker.backend' -ErrorAction SilentlyContinue) {
    throw 'Docker is starting or failed with processes still present. Quit Docker Desktop first. This launcher will not terminate it.'
}
$localRoot = [IO.Path]::GetFullPath($env:LOCALAPPDATA).TrimEnd('\')
$paths = foreach ($relative in @('Docker\run', 'docker-secrets-engine')) {
    $source = [IO.Path]::GetFullPath((Join-Path $localRoot $relative))
    if ($source -ne (Join-Path $localRoot $relative)) { throw 'Unexpected Docker runtime path.' }
    $ancestor = $source
    while ($ancestor) {
        if ((Test-Path -LiteralPath $ancestor) -and ((Get-Item -LiteralPath $ancestor -Force).Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw "Runtime directory ancestor is a reparse point: $ancestor" }
        $ancestor = Split-Path $ancestor -Parent
    }
    if (Test-Path -LiteralPath $source) {
        if (-not (Test-Path -LiteralPath $source -PathType Container)) { throw 'Docker runtime directory is not a directory.' }
        $source
    }
}
if (-not $PSCmdlet.ShouldProcess('Stopped Docker Desktop', 'Preserve runtime socket directories and start the engine')) { return }
if (Get-Process -Name 'Docker Desktop', 'com.docker.backend' -ErrorAction SilentlyContinue) { throw 'Docker started during checks; no socket directories were moved.' }
$stamp = (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + [guid]::NewGuid().ToString('N').Substring(0, 6)
foreach ($source in $paths) {
    $preserved = "$source.preserved-$stamp"
    if ((Split-Path $preserved -Parent) -ne (Split-Path $source -Parent) -or (Test-Path -LiteralPath $preserved)) { throw 'Unsafe runtime preservation destination.' }
    Move-Item -LiteralPath $source -Destination $preserved
    Write-Output "Preserved runtime sockets: $preserved"
}
$start = Invoke-DockerProbe @('desktop', 'start', '--timeout', '45') 60
if ($start.code -ne 0) { throw "Docker Desktop did not start. Runtime files remain preserved. $($start.output)" }
$state = Invoke-DockerProbe @('info', '--format', '{{.ServerVersion}} {{.ContainersRunning}}') 10
if ($state.code -ne 0) { throw "Docker engine verification failed: $($state.output)" }
Write-Output "Docker started (version, running containers): $($state.output)"
