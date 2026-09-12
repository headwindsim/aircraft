#Requires -Version 7.2
[CmdletBinding()]
param(
    [switch]$Baseline,
    [string]$BaselineRef = 'upstream/main',
    [switch]$SkipSetup,
    [ValidateRange(1, 32)][int]$Jobs = 4
)
. (Join-Path $PSScriptRoot 'Deployment-Common.ps1')
$repo = Get-A339XFullPath ([IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..')))
$buildId = (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + ([guid]::NewGuid().ToString('N').Substring(0, 8))
$local = Join-Path $repo '.fuel-trim-local'
$log = Join-Path $local "logs/build-$buildId.log"
$artifact = Join-Path $local "artifacts/$buildId"
$null = New-Item -ItemType Directory -Path (Split-Path $log -Parent) -Force
$record = @{ buildId = $buildId; validated = $false; kind = $(if ($Baseline) { 'baseline' } else { 'modified' }); packages = @() }
$exitCode = 1
function Invoke-BuildNative([string]$Program, [string[]]$Arguments) {
    ('> ' + $Program + ' ' + ($Arguments -join ' ')) | Tee-Object -FilePath $log -Append | Write-Host
    & $Program @Arguments 2>&1 | Tee-Object -FilePath $log -Append | Write-Host
    $code = $LASTEXITCODE
    "Exit code: $code" | Tee-Object -FilePath $log -Append | Write-Host
    if ($code -ne 0) { $exception = [Exception]::new("$Program failed with exit code $code. See $log"); $exception.Data['NativeExitCode'] = $code; throw $exception }
}
function Get-BuildSourceFingerprint {
    $patch = @(& git diff HEAD --binary -- . ':!docs/development/fuel-trim' ':!scripts/fuel-trim' ':!.gitignore') -join "`n"
    if ($LASTEXITCODE -ne 0) { throw 'Cannot fingerprint tracked source edits.' }
    $untracked = @(& git ls-files --others --exclude-standard)
    if ($LASTEXITCODE -ne 0) { throw 'Cannot fingerprint untracked source files.' }
    $parts = @($patch)
    foreach ($file in $untracked | Sort-Object) {
        if ($file -notmatch '^(docs/development/fuel-trim/|scripts/fuel-trim/)') {
            $parts += "$file $((Get-FileHash -LiteralPath (Join-Path $repo $file) -Algorithm SHA256).Hash)"
        }
    }
    return [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes(($parts -join "`n"))))
}
function Assert-BaselineSource([string]$Ref, [string]$SourceCommit) {
    $baselineCommit = & git rev-parse --verify --end-of-options "$Ref^{commit}"
    if ($LASTEXITCODE -ne 0 -or $baselineCommit -notmatch '^[a-fA-F0-9]{40}$') { throw "Cannot resolve baseline ref: $Ref" }
    if ($SourceCommit -ne $baselineCommit) { throw "Baseline requires HEAD at $Ref ($baselineCommit)." }
    $changed = @(& git diff $baselineCommit --name-only -- . ':!docs/development/fuel-trim' ':!scripts/fuel-trim' ':!.gitignore')
    if ($LASTEXITCODE -ne 0 -or $changed.Count) { throw 'Baseline requires unchanged aircraft source and toolchain.' }
    $untracked = @(& git ls-files --others --exclude-standard -- . ':!docs/development/fuel-trim' ':!scripts/fuel-trim' ':!.gitignore')
    if ($LASTEXITCODE -ne 0 -or $untracked.Count) { throw 'Baseline contains untracked aircraft or toolchain files.' }
    return $baselineCommit
}
Push-Location $repo
try {
    $null = Get-Command git, docker -ErrorAction Stop
    $commit = (& git rev-parse HEAD).Trim()
    if ($LASTEXITCODE -ne 0 -or $commit -notmatch '^[a-fA-F0-9]{40}$') { throw 'Cannot identify source commit.' }
    $record.sourceCommit = $commit
    $changes = @(& git status --porcelain --untracked-files=all)
    if ($LASTEXITCODE -ne 0) { throw 'Cannot inspect source changes.' }
    $record.sourceChanges = $changes
    $record.sourceDirty = $changes.Count -gt 0
    $record.sourceFingerprint = Get-BuildSourceFingerprint
    if ($Baseline) {
        $record.baselineRef = $BaselineRef
        $record.baselineSourceCommit = Assert-BaselineSource $BaselineRef $commit
    }
    $submodules = @(& git submodule status --recursive)
    if ($LASTEXITCODE -ne 0 -or @($submodules | Where-Object { $_ -match '^[-+U]' }).Count) { throw 'Initialize all submodules at their recorded revisions before building.' }
    $changedSubmodules = @(& git diff HEAD --name-only --ignore-submodules=untracked -- flybywire large-files)
    if ($LASTEXITCODE -ne 0 -or $changedSubmodules.Count) { throw 'Build requires unchanged tracked files and commits in flybywire and large-files submodules.' }
    $record.submodules = $submodules
    $imageMatch = [regex]::Matches((Get-Content -LiteralPath (Join-Path $repo 'scripts/dev-env/run.cmd') -Raw), 'ghcr\.io/flybywiresim/dev-env@sha256:[a-f0-9]{64}')
    if ($imageMatch.Count -ne 1) { throw 'Expected exactly one pinned development image in run.cmd.' }
    $image = $imageMatch[0].Value
    $record.image = $image
    $record.jobs = $Jobs
    $record.setupSkipped = [bool]$SkipSetup
    $record.startedUtc = [DateTime]::UtcNow.ToString('o')
    $record.logPath = $log
    # No host env-file: setup/build may delete sources when GITHUB_ACTIONS=true.
    $dockerArgs = @('run', '--rm', '-v', "${repo}:/external", '-w', '/external', '--env', 'CI=true', '--env', 'GITHUB_ACTIONS=', $image)
    Invoke-BuildNative (Join-Path $PSHOME 'pwsh.exe') @('-NoProfile', '-File', (Join-Path $PSScriptRoot 'Start-A339XBuildEnvironment.ps1'))
    Invoke-BuildNative docker @('info', '--format', '{{.ServerVersion}}')
    if (-not $SkipSetup) { Invoke-BuildNative docker ($dockerArgs + './scripts/setup.sh') }
    elseif (-not (Test-Path -LiteralPath (Join-Path $repo 'node_modules') -PathType Container)) { throw 'SkipSetup requires existing node_modules from setup.sh.' }
    foreach ($generated in @('build-common', 'build-a339x')) {
        $generatedPath = Get-A339XFullPath (Join-Path $repo $generated)
        if (Test-Path -LiteralPath $generatedPath) { $null = Get-A339XInventory $generatedPath }
    }
    Invoke-BuildNative docker ($dockerArgs + './scripts/copy_a339x.sh')
    Invoke-BuildNative docker ($dockerArgs + @('pnpm', 'run', 'build-a339x:copy-cargo-config'))
    # copy_a339x.sh preserves source timestamps. A restored override may otherwise
    # reuse a newer Rust artifact built from different source in these same paths.
    Invoke-BuildNative docker ($dockerArgs + @('cargo', 'clean', '-p', 'systems', '-p', 'a320_systems', '-p', 'a320_systems_wasm'))
    if (-not $Baseline) { Invoke-BuildNative (Join-Path $PSHOME 'pwsh.exe') @('-NoProfile', '-File', (Join-Path $PSScriptRoot 'Test-A339XFuel.ps1')) }
    Invoke-BuildNative docker ($dockerArgs + @('./scripts/build_a339x.sh', '--no-tty', "-j$Jobs"))
    if ((& git rev-parse HEAD).Trim() -ne $commit) { throw 'HEAD changed during build. Artifact cannot be attributed to one commit.' }
    if ((Get-BuildSourceFingerprint) -ne $record.sourceFingerprint) { throw 'Source content changed during build. Rerun after source edits finish.' }
    $afterSubmodules = @(& git submodule status --recursive)
    if ($LASTEXITCODE -ne 0 -or (Compare-Object $submodules $afterSubmodules)) { throw 'Submodule revisions changed during build.' }
    # Save packages outside directories recreated by copy_a339x.sh.
    $null = New-Item -ItemType Directory -Path (Join-Path $artifact 'packages')
    foreach ($name in $script:A339XNames) {
        $output = Join-Path $repo "build-a339x/out/$name"
        $hashes = Assert-A339XPackage $output $name
        $saved = Join-Path $artifact "packages/$name"
        Copy-Item -LiteralPath $output -Destination $saved -Recurse
        Assert-A339XInventory $saved $hashes
        $record.packages += @{ name = $name; hashes = $hashes }
    }
    $record.validated = $true
    $record.completedUtc = [DateTime]::UtcNow.ToString('o')
    $record | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath (Join-Path $artifact 'build-record.json')
    Write-Output "Validated $($record.kind) artifact: $artifact"
    $exitCode = 0
} catch {
    if ($_.Exception.Data.Contains('NativeExitCode')) { $exitCode = [int]$_.Exception.Data['NativeExitCode'] }
    $record.failure = $_.Exception.Message
    $record.validated = $false
    $record | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath (Join-Path (Split-Path $log -Parent) "failed-build-$buildId.json")
    Write-Error -Message $_.Exception.Message -ErrorAction Continue
} finally { Pop-Location }
exit $exitCode
