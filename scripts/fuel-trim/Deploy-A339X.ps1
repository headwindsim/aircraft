#Requires -Version 7.2
[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)][string]$ArtifactPath,
    [string]$ConfigPath = (Join-Path $PSScriptRoot '../../.fuel-trim-local/deployment.json')
)
. (Join-Path $PSScriptRoot 'Deployment-Common.ps1')
$artifact = Get-A339XFullPath $ArtifactPath
$config = Get-A339XDeploymentConfig ([IO.Path]::GetFullPath($ConfigPath))
foreach ($root in $config.packageRoots) { if (Test-A339XInside $artifact $root) { throw 'Artifact must be outside simulator package roots.' } }
$build = Get-Content -LiteralPath (Join-Path $artifact 'build-record.json') -Raw | ConvertFrom-Json -AsHashtable
if ($build.validated -isnot [bool] -or -not $build.validated -or $build.sourceCommit -notmatch '^[a-fA-F0-9]{40}$' -or $build.buildId -notmatch '^[a-zA-Z0-9._-]+$') { throw 'Artifact has no valid successful build record.' }
if (@($build.packages).Count -lt 1 -or @($build.packages).Count -gt 2 -or @($build.packages.name | Select-Object -Unique).Count -ne @($build.packages).Count -or $script:A339XNames[0] -notin $build.packages.name) { throw 'Invalid build package list.' }
$packages = foreach ($package in $build.packages) {
    if ($package.name -notin $script:A339XNames) { throw 'Unrecognized artifact package.' }
    $source = Join-Path (Join-Path $artifact 'packages') $package.name
    $null = Assert-A339XPackage $source $package.name
    Assert-A339XInventory $source $package.hashes
    @{ name = $package.name; source = $source; hashes = $package.hashes }
}
Assert-A339XSimulatorClosed
Assert-A339XDestinations $config $packages
Assert-A339XDependencies $config $packages
if ($PSCmdlet.ShouldProcess($config.community, "Install validated A339X build $($build.buildId) with verified external backup and rollback")) {
    Invoke-A339XReplacement $config $packages $build.sourceCommit $build.buildId
}
