#Requires -Version 7.2
# Exercises the build's baseline check in a temporary Git repository, without invoking Docker.
[CmdletBinding()]
param()
. (Join-Path $PSScriptRoot 'Deployment-Common.ps1')
$parseErrors = $null
$ast = [Management.Automation.Language.Parser]::ParseFile((Join-Path $PSScriptRoot 'Build-A339X.ps1'), [ref]$null, [ref]$parseErrors)
if ($parseErrors.Count) { throw 'Build script failed to parse.' }
$definition = $ast.Find({ param($node) $node -is [Management.Automation.Language.FunctionDefinitionAst] -and $node.Name -eq 'Assert-BaselineSource' }, $false)
if (-not $definition) { throw 'Baseline check is missing from the build script.' }
. ([scriptblock]::Create($definition.Extent.Text))

function Invoke-FixtureGit([string[]]$GitArguments) {
    $result = & git @GitArguments
    if ($LASTEXITCODE -ne 0) { throw 'Fixture Git command failed.' }
    return $result
}
function Expect-Rejection([scriptblock]$Action, [string]$Message) {
    try { & $Action } catch { if ($_.Exception.Message -notlike $Message) { throw }; return }
    throw 'Expected baseline rejection did not occur.'
}

$fixture = Join-Path ([IO.Path]::GetTempPath()) ('a339x-preflight-test-' + [guid]::NewGuid())
$null = New-Item -ItemType Directory -Path $fixture
Push-Location $fixture
try {
    Invoke-FixtureGit @('init', '--quiet')
    'base aircraft' | Set-Content -LiteralPath 'aircraft.txt'
    Invoke-FixtureGit @('add', 'aircraft.txt')
    Invoke-FixtureGit @('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--quiet', '-m', 'fixture base')
    $base = (Invoke-FixtureGit @('rev-parse', 'HEAD')).Trim()
    Invoke-FixtureGit @('update-ref', 'refs/remotes/upstream/main', $base)
    if ((Assert-BaselineSource 'upstream/main' $base) -ne $base) { throw 'Clean upstream baseline was rejected.' }
    'untracked source' | Set-Content -LiteralPath 'new-aircraft.txt'
    Expect-Rejection { Assert-BaselineSource 'upstream/main' $base } '*untracked aircraft or toolchain files*'
    Remove-Item -LiteralPath 'new-aircraft.txt'

    'changed aircraft' | Set-Content -LiteralPath 'aircraft.txt'
    Expect-Rejection { Assert-BaselineSource 'upstream/main' $base } '*unchanged aircraft source*'
    Invoke-FixtureGit @('add', 'aircraft.txt')
    Expect-Rejection { Assert-BaselineSource 'upstream/main' $base } '*unchanged aircraft source*'
    Invoke-FixtureGit @('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--quiet', '-m', 'fixture feature')
    $feature = (Invoke-FixtureGit @('rev-parse', 'HEAD')).Trim()
    Expect-Rejection { Assert-BaselineSource 'upstream/main' $feature } '*requires HEAD at upstream/main*'
    if ((Assert-BaselineSource $feature $feature) -ne $feature) { throw 'Explicit baseline reference was rejected.' }
    Expect-Rejection { Assert-BaselineSource 'missing-fixture-ref' $feature 2>$null } '*Cannot resolve baseline ref*'
    Write-Output 'PASS: default upstream baseline, explicit reference, committed feature mismatch, staged/unstaged/untracked aircraft changes, and missing reference. Docker was not invoked.'
} finally {
    Pop-Location
    $resolved = Get-A339XFullPath $fixture
    $tempRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath()).TrimEnd('\')
    if ((Test-A339XInside $resolved $tempRoot) -and (Split-Path $resolved -Leaf) -like 'a339x-preflight-test-*') {
        $null = Get-A339XInventory $resolved
        Remove-Item -LiteralPath $resolved -Recurse -Force
    }
}
