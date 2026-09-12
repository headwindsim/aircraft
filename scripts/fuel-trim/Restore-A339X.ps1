#Requires -Version 7.2
[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)][string]$RecordPath,
    [string]$ConfigPath = (Join-Path $PSScriptRoot '../../.fuel-trim-local/deployment.json')
)
. (Join-Path $PSScriptRoot 'Deployment-Common.ps1')
$config = Get-A339XDeploymentConfig ([IO.Path]::GetFullPath($ConfigPath))
$recordFile = Get-A339XFullPath $RecordPath
if (-not (Test-A339XInside $recordFile $config.backup)) { throw 'Restore record must be inside configured backupRoot.' }
$record = Get-Content -LiteralPath $recordFile -Raw | ConvertFrom-Json -AsHashtable
if ($record.community -ne $config.community -or $record.result -notin @('installed', 'failed-restored', 'rollback-failed', 'prepared')) { throw 'Record does not match the selected Community installation.' }
if (@($record.packages).Count -lt 1 -or @($record.packages).Count -gt 2 -or @($record.packages.name | Select-Object -Unique).Count -ne @($record.packages).Count) { throw 'Invalid restore package list.' }
$packages = foreach ($entry in $record.packages) {
    if ($entry.name -notin $script:A339XNames -or $entry.destination -ne (Join-Path $config.community $entry.name)) { throw 'Invalid recorded destination.' }
    if ($entry.backup) {
        $backup = Get-A339XFullPath $entry.backup
        if (-not (Test-A339XInside $backup (Split-Path $recordFile -Parent)) -or (Get-A339XIdentity $backup) -ne $entry.name) { throw 'Unverified restore backup.' }
        Assert-A339XInventory $backup $entry.previousHashes
    }
    $package = @{ name = $entry.name; source = $entry.backup; hashes = $entry.previousHashes }
    if (Test-Path -LiteralPath $entry.destination) {
        $current = Get-A339XInventory $entry.destination
        $owned = $false
        foreach ($expected in @($entry.installedHashes, $entry.previousHashes)) {
            if (-not $expected) { continue }
            $unmatched = @($current.Keys | Where-Object { -not $expected.Contains($_) -or $expected[$_] -ne $current[$_] })
            if ($unmatched.Count -eq 0) { $owned = $true; break }
        }
        if (-not $owned) { throw "Current package files do not match this deployment record: $($entry.name)" }
        # Rechecked by the shared destination guard, including under the replacement lock.
        $package.restoreInventory = $current
    }
    $package
}
Assert-A339XSimulatorClosed
Assert-A339XDestinations $config $packages
if ($PSCmdlet.ShouldProcess($config.community, 'Restore exact prior A339X installation from verified recorded backups')) {
    Invoke-A339XReplacement $config $packages $record.sourceCommit "restore-$($record.buildId)"
}
