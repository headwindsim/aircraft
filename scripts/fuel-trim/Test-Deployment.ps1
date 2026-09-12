#Requires -Version 7.2
# Standalone fixture checks. Never discovers or writes to the real simulator.
[CmdletBinding()]
param()
. (Join-Path $PSScriptRoot 'Deployment-Common.ps1')
$fixture = Join-Path ([IO.Path]::GetTempPath()) ('a339x-deploy-test-' + [guid]::NewGuid())
$null = New-Item -ItemType Directory -Path $fixture
$oldAppData = $env:APPDATA
$oldLocalAppData = $env:LOCALAPPDATA
function Assert($Condition, [string]$Message) { if (-not $Condition) { throw $Message } }
function Expect-Failure([scriptblock]$Action) {
    $failed = $false
    try { & $Action } catch { $failed = $true; Write-Verbose $_.Exception.Message }
    Assert $failed 'Expected rejection did not occur.'
}
function New-FixturePackage([string]$Path, [string]$Marker) {
    $airplane = 'SimObjects/Airplanes/Headwind_A330neo'
    $files = @("$airplane/aircraft.cfg", "$airplane/flight_model.cfg", "$airplane/systems.cfg", "$airplane/engines.cfg", "$airplane/panel/panel.cfg",
        "$airplane/panel/systems.wasm", "$airplane/panel/fbw.wasm", "$airplane/panel/fadec-a339x.wasm", "$airplane/panel/terronnd.wasm", "$airplane/panel/extra-backend-a339x.wasm",
        "$airplane/model/A330_NEO_INTERIOR.xml", "$airplane/model/test.gltf", "$airplane/model/test.bin", "$airplane/texture/test.DDS",
        'html_ui/Pages/VCockpit/Instruments/A339X/SD/sd.js', 'html_ui/PFD/pfd.js', 'html_ui/ND/nd.js', 'html_ui/MCDU/mcdu.js')
    foreach ($file in $files) {
        $full = Join-Path $Path $file
        $null = New-Item -ItemType Directory -Path (Split-Path $full -Parent) -Force
        Set-Content -LiteralPath $full -Value $Marker
    }
    @{ creator = 'Headwind Simulations'; title = 'A339X (fixture)'; content_type = 'AIRCRAFT'; package_version = '1.0.0'; minimum_game_version = '1.0.0'; dependencies = @() } |
        ConvertTo-Json | Set-Content -LiteralPath (Join-Path $Path 'manifest.json')
    @{ content = @($files | ForEach-Object { @{ path = $_; size = (Get-Item -LiteralPath (Join-Path $Path $_)).Length; date = 0 } }) } |
        ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $Path 'layout.json')
}
function New-PartialFixture([string]$From, [string]$Target) {
    $relative = 'SimObjects/Airplanes/Headwind_A330neo/aircraft.cfg'
    $null = New-Item -ItemType Directory -Path (Split-Path (Join-Path $Target $relative) -Parent) -Force
    Microsoft.PowerShell.Management\Copy-Item -LiteralPath (Join-Path $From $relative) -Destination (Join-Path $Target $relative)
}
try {
    $env:APPDATA = Join-Path $fixture 'appdata'
    $env:LOCALAPPDATA = Join-Path $fixture 'localappdata'
    $cfg = Join-Path $env:APPDATA 'Microsoft Flight Simulator 2024/UserCfg.opt'
    $community = Join-Path $fixture 'sim/Community'
    $null = New-Item -ItemType Directory -Path $community, (Split-Path $cfg -Parent)
    ('InstalledPackagesPath "' + (Split-Path $community -Parent) + '"') | Set-Content -LiteralPath $cfg
    $configPath = Join-Path $fixture 'deployment.json'
    $configData = @{ userCfgPath = $cfg; communityPath = $community; backupRoot = (Join-Path $fixture 'backups') }
    $configData | ConvertTo-Json | Set-Content -LiteralPath $configPath
    $steamApps = Join-Path $fixture 'steam/steamapps'
    $corePackages = Join-Path $steamApps 'common/MSFS2024/Packages'
    $null = New-Item -ItemType Directory -Path $corePackages
    'fixture' | Set-Content -LiteralPath (Join-Path (Split-Path $corePackages -Parent) 'FlightSimulator2024.exe')
    $appManifest = Join-Path $steamApps 'appmanifest_2537590.acf'
    @('"appid" "2537590"', '"StateFlags" "4"', '"installdir" "MSFS2024"') | Set-Content -LiteralPath $appManifest
    $configData.steamAppManifestPath = $appManifest
    $configData | ConvertTo-Json | Set-Content -LiteralPath $configPath
    Assert ((Get-A339XDeploymentConfig $configPath).packageRoots -contains $corePackages) 'Steam core package root was not verified.'
    '"appid" "1250410"' | Set-Content -LiteralPath $appManifest
    Expect-Failure { Get-A339XDeploymentConfig $configPath }
    @('"appid" "2537590"', '"StateFlags" "4"', '"installdir" "MSFS2024"') | Set-Content -LiteralPath $appManifest
    $name = $script:A339XNames[0]
    $artifact = Join-Path $fixture 'artifact'
    $source = Join-Path $artifact "packages/$name"
    $destination = Join-Path $community $name
    New-FixturePackage $source 'new'
    New-FixturePackage $destination 'original'
    $oldHashes = Get-A339XInventory $destination
    $newHashes = Assert-A339XPackage $source $name
    @{ sourceCommit = ('a' * 40); buildId = 'fixture'; validated = $true; packages = @(@{ name = $name; hashes = $newHashes }) } |
        ConvertTo-Json -Depth 10 | Set-Content -LiteralPath (Join-Path $artifact 'build-record.json')
    $unrelated = Join-Path $community 'unrelated'
    $null = New-Item -ItemType Directory -Path $unrelated
    'untouched' | Set-Content -LiteralPath (Join-Path $unrelated 'keep.txt')
    & (Join-Path $PSScriptRoot 'Deploy-A339X.ps1') -ArtifactPath $artifact -ConfigPath $configPath -WhatIf
    Assert (-not (Test-Path -LiteralPath $configData.backupRoot)) 'WhatIf created backups.'
    Assert-A339XInventory $destination $oldHashes
    $recordPath = & (Join-Path $PSScriptRoot 'Deploy-A339X.ps1') -ArtifactPath $artifact -ConfigPath $configPath
    Assert-A339XInventory $destination $newHashes
    $initial = Get-Content -LiteralPath (Join-Path $configData.backupRoot 'initial-deployment-record.txt') -Raw
    & (Join-Path $PSScriptRoot 'Restore-A339X.ps1') -RecordPath $recordPath -ConfigPath $configPath -WhatIf
    Assert-A339XInventory $destination $newHashes
    $null = & (Join-Path $PSScriptRoot 'Restore-A339X.ps1') -RecordPath $recordPath -ConfigPath $configPath
    Assert-A339XInventory $destination $oldHashes
    Assert ($initial -eq (Get-Content -LiteralPath (Join-Path $configData.backupRoot 'initial-deployment-record.txt') -Raw)) 'Initial backup pointer changed.'

    # Fail exactly one install copy after the old package has been removed. Recovery copies use the real cmdlet.
    $global:A339XFixtureFailDestination = $destination
    $global:A339XFixtureFailOnce = $true
    $global:A339XFixturePartialCreated = $false
    function Copy-Item {
        param([string]$LiteralPath, [string]$Destination, [switch]$Recurse)
        if ($global:A339XFixtureFailOnce -and $Destination -eq $global:A339XFixtureFailDestination) {
            $global:A339XFixtureFailOnce = $false
            New-PartialFixture $LiteralPath $Destination
            $global:A339XFixturePartialCreated = $true
            throw 'Injected installation failure after a partial copy.'
        }
        Microsoft.PowerShell.Management\Copy-Item -LiteralPath $LiteralPath -Destination $Destination -Recurse:$Recurse
    }
    Expect-Failure { & (Join-Path $PSScriptRoot 'Deploy-A339X.ps1') -ArtifactPath $artifact -ConfigPath $configPath }
    Remove-Item Function:Copy-Item
    Assert $global:A339XFixturePartialCreated 'Copy failure did not create a partial destination.'
    Assert-A339XInventory $destination $oldHashes
    Assert ((Get-Content -LiteralPath (Join-Path $unrelated 'keep.txt')).Trim() -eq 'untouched') 'Unrelated addon changed.'
    Assert (@(Get-ChildItem -LiteralPath $configData.backupRoot -Filter deployment-record.json -Recurse | Where-Object { (Get-Content -LiteralPath $_.FullName -Raw | ConvertFrom-Json).result -eq 'failed-restored' }).Count -eq 1) 'Failure rollback record missing.'

    $interrupted = Get-Content -LiteralPath $recordPath -Raw | ConvertFrom-Json -AsHashtable
    $interrupted.result = 'prepared'
    $interrupted | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $recordPath
    foreach ($partialSource in @($source, $interrupted.packages[0].backup)) {
        Remove-A339XSelectedPackage $destination $community $name
        New-PartialFixture $partialSource $destination
        $partialHashes = Get-A339XInventory $destination
        Expect-Failure { & (Join-Path $PSScriptRoot 'Deploy-A339X.ps1') -ArtifactPath $artifact -ConfigPath $configPath -WhatIf }
        & (Join-Path $PSScriptRoot 'Restore-A339X.ps1') -RecordPath $recordPath -ConfigPath $configPath -WhatIf
        Assert-A339XInventory $destination $partialHashes

        $partialFile = Join-Path $destination 'SimObjects/Airplanes/Headwind_A330neo/aircraft.cfg'
        'tampered' | Set-Content -LiteralPath $partialFile
        Expect-Failure { & (Join-Path $PSScriptRoot 'Restore-A339X.ps1') -RecordPath $recordPath -ConfigPath $configPath }
        Assert ((Get-Content -LiteralPath $partialFile).Trim() -eq 'tampered') 'Rejected partial restore changed a file.'
        New-PartialFixture $partialSource $destination
        $extra = Join-Path $destination 'unrecorded.txt'
        'unrelated' | Set-Content -LiteralPath $extra
        Expect-Failure { & (Join-Path $PSScriptRoot 'Restore-A339X.ps1') -RecordPath $recordPath -ConfigPath $configPath }
        Assert (Test-Path -LiteralPath $extra) 'Rejected partial restore removed an unknown file.'
        Remove-Item -LiteralPath $extra
        $null = & (Join-Path $PSScriptRoot 'Restore-A339X.ps1') -RecordPath $recordPath -ConfigPath $configPath
        Assert-A339XInventory $destination $oldHashes
    }
    Remove-A339XSelectedPackage $destination $community $name
    $null = New-Item -ItemType Directory -Path $destination
    $null = & (Join-Path $PSScriptRoot 'Restore-A339X.ps1') -RecordPath $recordPath -ConfigPath $configPath
    Assert-A339XInventory $destination $oldHashes

    'unexpected' | Set-Content -LiteralPath (Join-Path $source 'extra.txt')
    Expect-Failure { & (Join-Path $PSScriptRoot 'Deploy-A339X.ps1') -ArtifactPath $artifact -ConfigPath $configPath -WhatIf }
    Remove-Item -LiteralPath (Join-Path $source 'extra.txt')
    $changedFile = Join-Path $source 'SimObjects/Airplanes/Headwind_A330neo/aircraft.cfg'
    'bad' | Set-Content -LiteralPath $changedFile
    Expect-Failure { & (Join-Path $PSScriptRoot 'Deploy-A339X.ps1') -ArtifactPath $artifact -ConfigPath $configPath -WhatIf }
    'new' | Set-Content -LiteralPath $changedFile
    $manifestPath = Join-Path $source 'manifest.json'
    $manifestText = Get-Content -LiteralPath $manifestPath -Raw
    $manifestData = $manifestText | ConvertFrom-Json -AsHashtable
    $manifestData.dependencies = @(@{ name = 'missing-required-package'; package_version = '1.0.0' })
    $manifestData | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $manifestPath
    Expect-Failure { Assert-A339XDependencies (Get-A339XDeploymentConfig $configPath) @(@{ name = $name; source = $source }) }
    $dependencyPath = Join-Path (Split-Path $community -Parent) 'Official2020/Steam/missing-required-package'
    $null = New-Item -ItemType Directory -Path $dependencyPath
    @{ package_version = '1.0.0' } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $dependencyPath 'manifest.json')
    Assert-A339XDependencies (Get-A339XDeploymentConfig $configPath) @(@{ name = $name; source = $source })
    $manifestData.dependencies = @(@{ name = 'core-test-package'; package_version = '0.1.129' })
    $manifestData | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $manifestPath
    $coreDependency = Join-Path $corePackages 'core-test-package'
    $null = New-Item -ItemType Directory -Path $coreDependency
    @{ package_version = '0.1.13' } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $coreDependency 'manifest.json')
    $dependencyWarnings = @(Assert-A339XDependencies (Get-A339XDeploymentConfig $configPath) @(@{ name = $name; source = $source }) 3>&1)
    Assert ($dependencyWarnings.Count -eq 1 -and "$($dependencyWarnings[0])" -match 'metadata mismatch.*Compatibility is unverified') 'Lower cross-generation metadata did not produce a compatibility warning.'
    @{ package_version = 'invalid' } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $coreDependency 'manifest.json')
    Expect-Failure { Assert-A339XDependencies (Get-A339XDeploymentConfig $configPath) @(@{ name = $name; source = $source }) }
    @{ package_version = '0.1.129' } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $coreDependency 'manifest.json')
    Assert-A339XDependencies (Get-A339XDeploymentConfig $configPath) @(@{ name = $name; source = $source })
    Set-Content -LiteralPath $manifestPath -Value $manifestText -NoNewline
    $companionSource = Join-Path $fixture 'companion'
    $null = New-Item -ItemType Directory -Path $companionSource
    $companionManifest = @{ package_version = '1.0.0'; dependencies = @(@{ name = $name; package_version = '0.300.0' }) }
    $companionManifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $companionSource 'manifest.json')
    $bundle = @(@{ name = $name; source = $source }, @{ name = "$name-lock-highlight"; source = $companionSource })
    Assert-A339XDependencies (Get-A339XDeploymentConfig $configPath) $bundle
    $companionManifest.package_version = '2.0.0'
    $companionManifest | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $companionSource 'manifest.json')
    Expect-Failure { Assert-A339XDependencies (Get-A339XDeploymentConfig $configPath) $bundle }
    $secondaryCommunity = Join-Path (Split-Path $community -Parent) 'Community2024'
    $duplicate = Join-Path $secondaryCommunity $name
    $livery = Join-Path $secondaryCommunity 'unrelated-livery'
    $null = New-Item -ItemType Directory -Path $duplicate, $livery
    Copy-Item -LiteralPath $manifestPath -Destination (Join-Path $duplicate 'manifest.json')
    Expect-Failure { Assert-A339XDestinations (Get-A339XDeploymentConfig $configPath) @(@{ name = $name }) }
    Remove-A339XSelectedPackage $duplicate $secondaryCommunity $name
    @{ creator = 'Headwind Simulations'; title = 'A339X Livery'; content_type = 'LIVERY' } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $livery 'manifest.json')
    Assert-A339XDestinations (Get-A339XDeploymentConfig $configPath) @(@{ name = $name })
    $configData.backupRoot = Join-Path $community 'bad-backups'
    $configData | ConvertTo-Json | Set-Content -LiteralPath $configPath
    Expect-Failure { Get-A339XDeploymentConfig $configPath }
    $configData.backupRoot = Join-Path $fixture 'backups'
    $configData.communityPath = Join-Path $fixture 'wrong-community'
    $configData | ConvertTo-Json | Set-Content -LiteralPath $configPath
    Expect-Failure { Get-A339XDeploymentConfig $configPath }
    $junction = Join-Path $community 'linked-addon'
    $null = New-Item -ItemType Junction -Path $junction -Target $unrelated
    try { Expect-Failure { Assert-A339XDestinations @{ community = $community } @(@{ name = $name }) } }
    finally { [IO.Directory]::Delete($junction) }
    $configData.communityPath = $community
    $configData | ConvertTo-Json | Set-Content -LiteralPath $configPath
    Remove-A339XSelectedPackage $destination $community $name
    $freshRecord = & (Join-Path $PSScriptRoot 'Deploy-A339X.ps1') -ArtifactPath $artifact -ConfigPath $configPath
    Assert-A339XInventory $destination $newHashes
    $null = & (Join-Path $PSScriptRoot 'Restore-A339X.ps1') -RecordPath $freshRecord -ConfigPath $configPath
    Assert (-not (Test-Path -LiteralPath $destination)) 'Restore did not remove a package absent before installation.'
    Write-Output 'PASS: deploy/restore WhatIf, install/restore hashes, original backup preservation, partial-copy rollback and recorded recovery, tampered/unknown partial-file rejection, unrelated addon preservation, fresh-install rollback, extra files, same-size tampering, missing/invalid/present dependency, metadata compatibility warning, bundled version consistency, verified Steam core package root and wrong app rejection, duplicate Community2024 package, unrelated livery, unsafe backup, wrong Community, junction rejection.'
} finally {
    $env:APPDATA = $oldAppData
    $env:LOCALAPPDATA = $oldLocalAppData
    if (Test-Path Function:Copy-Item) { Remove-Item Function:Copy-Item }
    Remove-Variable -Name A339XFixtureFailDestination, A339XFixtureFailOnce, A339XFixturePartialCreated -Scope Global -ErrorAction SilentlyContinue
    $resolved = Get-A339XFullPath $fixture
    $tempRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath()).TrimEnd('\')
    if ((Test-A339XInside $resolved $tempRoot) -and (Split-Path $resolved -Leaf) -like 'a339x-deploy-test-*') {
        $null = Get-A339XInventory $resolved
        Remove-Item -LiteralPath $resolved -Recurse -Force
    }
}
