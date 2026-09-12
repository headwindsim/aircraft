#Requires -Version 7.2
[CmdletBinding()]
param()
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$repo = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$id = (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + [guid]::NewGuid().ToString('N').Substring(0, 8)
$log = Join-Path $repo ".fuel-trim-local/logs/test-$id.log"
$null = New-Item -ItemType Directory -Path (Split-Path $log -Parent) -Force
$exitCode = 1
function Invoke-TestNative([string]$Program, [string[]]$Arguments) {
    ('> ' + $Program + ' ' + ($Arguments -join ' ')) | Tee-Object -FilePath $log -Append | Write-Host
    & $Program @Arguments 2>&1 | Tee-Object -FilePath $log -Append | Write-Host
    $code = $LASTEXITCODE
    "Exit code: $code" | Tee-Object -FilePath $log -Append | Write-Host
    if ($code -ne 0) { $exception = [Exception]::new("Test command failed with exit code $code. See $log"); $exception.Data['NativeExitCode'] = $code; throw $exception }
}
Push-Location $repo
try {
    $null = Get-Command docker -ErrorAction Stop
    $imageMatch = [regex]::Matches((Get-Content -LiteralPath (Join-Path $repo 'scripts/dev-env/run.cmd') -Raw), 'ghcr\.io/flybywiresim/dev-env@sha256:[a-f0-9]{64}')
    if ($imageMatch.Count -ne 1) { throw 'Expected exactly one pinned development image in run.cmd.' }
    $dockerArgs = @('run', '--rm', '-v', "${repo}:/external", '-w', '/external', '--env', 'CI=true', '--env', 'GITHUB_ACTIONS=', $imageMatch[0].Value)
    Invoke-TestNative docker ($dockerArgs + @('bash', '-c', 'set -e; clang++ -std=c++17 -Wall -Wextra -Werror scripts/fuel-trim/fuel-trim-test.cpp -o /tmp/a339x-fuel-trim-test; /tmp/a339x-fuel-trim-test'))
    Invoke-TestNative docker ($dockerArgs + @('bash', '-c', 'set -e; clang++ -std=c++17 -Wall -Wextra -Werror -DLOG_LEVEL=0 -Ihdw-a339x/src/wasm/fadec_a339x/src/Fadec -Iflybywire/fbw-common/src/wasm/cpp-msfs-framework/lib scripts/fuel-trim/fuel-state-test.cpp hdw-a339x/src/wasm/fadec_a339x/src/Fadec/FuelConfiguration_A339X.cpp -o /tmp/a339x-fuel-state-test; /tmp/a339x-fuel-state-test'))
    Invoke-TestNative docker ($dockerArgs + @('node', '--test', 'scripts/fuel-trim/contracts.test.cjs', 'scripts/fuel-trim/refuel.test.cjs', 'scripts/tests/datastore.test.cjs', 'scripts/tests/takeoff-report.test.cjs', 'scripts/tests/takeoff-report-ui.test.cjs', 'scripts/tests/takeoff-speeds.test.cjs', 'scripts/tests/vnav-validity.test.cjs', 'scripts/tests/fuel-pred-mathjs.test.cjs', 'scripts/step-climb/step-climb.test.cjs'))
    foreach ($pair in @(
        @('hdw-a339x/src/wasm/systems/a320_systems/src/fuel/mod.rs', 'build-a339x/src/wasm/systems/a320_systems/src/fuel/mod.rs'),
        @('hdw-a339x/src/wasm/systems/a320_systems/src/fuel/test.rs', 'build-a339x/src/wasm/systems/a320_systems/src/fuel/test.rs'),
        @('hdw-a339x-common/src/wasm/systems/systems/src/fuel/mod.rs', 'build-common/src/wasm/systems/systems/src/fuel/mod.rs')
    )) {
        if (-not (Test-Path -LiteralPath $pair[1]) -or (Get-FileHash -LiteralPath $pair[0]).Hash -ne (Get-FileHash -LiteralPath $pair[1]).Hash) {
            throw 'Rust test sources are stale. Run Build-A339X.ps1 to regenerate and validate them before building.'
        }
    }
    Invoke-TestNative docker ($dockerArgs + @('cargo', 'test', '-p', 'a320_systems', '--lib', 'fuel::', '--locked'))
    Invoke-TestNative (Join-Path $PSHOME 'pwsh.exe') @('-NoProfile', '-File', (Join-Path $PSScriptRoot 'Test-Deployment.ps1'))
    Invoke-TestNative (Join-Path $PSHOME 'pwsh.exe') @('-NoProfile', '-File', (Join-Path $PSScriptRoot 'Test-BuildPreflight.ps1'))
    Write-Output "Fuel and deployment checks passed. Log: $log"
    $exitCode = 0
} catch {
    if ($_.Exception.Data.Contains('NativeExitCode')) { $exitCode = [int]$_.Exception.Data['NativeExitCode'] }
    Write-Error -Message $_.Exception.Message -ErrorAction Continue
} finally { Pop-Location }
exit $exitCode
