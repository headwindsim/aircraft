#Requires -Version 7.2
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$script:A339XNames = @('headwindsim-aircraft-a330-900', 'headwindsim-aircraft-a330-900-lock-highlight')

function Get-A339XFullPath([string]$Path) {
    if ([string]::IsNullOrWhiteSpace($Path) -or -not [IO.Path]::IsPathFullyQualified($Path)) { throw 'An absolute path is required.' }
    $full = [IO.Path]::GetFullPath($Path).TrimEnd([IO.Path]::DirectorySeparatorChar)
    if ($full -eq [IO.Path]::GetPathRoot($full).TrimEnd('\')) { throw 'Drive roots are not allowed.' }
    $part = $full
    while ($part) {
        if ((Test-Path -LiteralPath $part) -and ((Get-Item -Force -LiteralPath $part).Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw "Reparse point refused: $part" }
        $part = Split-Path -Parent $part
    }
    return $full
}

function Test-A339XInside([string]$Path, [string]$Root) {
    return $Path.Equals($Root, [StringComparison]::OrdinalIgnoreCase) -or $Path.StartsWith($Root.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase)
}

function Get-A339XInventory([string]$Path) {
    $root = Get-A339XFullPath $Path
    if (-not (Test-Path -LiteralPath $root -PathType Container)) { throw "Missing package: $root" }
    $hashes = [ordered]@{}
    # Walk one directory at a time so a junction is rejected before traversal.
    $pending = [Collections.Generic.Stack[string]]::new()
    $pending.Push($root)
    while ($pending.Count) {
        foreach ($item in Get-ChildItem -LiteralPath $pending.Pop() -Force) {
            if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "Package contains a reparse point: $($item.FullName)" }
            if ($item.PSIsContainer) { $pending.Push($item.FullName) }
            else { $hashes[[IO.Path]::GetRelativePath($root, $item.FullName).Replace('\', '/')] = (Get-FileHash -LiteralPath $item.FullName -Algorithm SHA256).Hash }
        }
    }
    return $hashes
}

function Assert-A339XInventory([string]$Path, $Expected) {
    $actual = Get-A339XInventory $Path
    if ($null -eq $Expected -or $actual.Count -ne $Expected.Count) { throw "File inventory differs: $Path" }
    foreach ($key in $actual.Keys) {
        if (-not $Expected.Contains($key) -or $Expected[$key] -notmatch '^[a-fA-F0-9]{64}$' -or $actual[$key] -ne $Expected[$key]) { throw "Hash differs: $key" }
    }
}

function Get-A339XIdentity([string]$Path) {
    $manifestPath = Join-Path $Path 'manifest.json'
    if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) { return $null }
    $manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json -AsHashtable
    if ($manifest.creator -ne 'Headwind Simulations' -or $manifest.content_type -ne 'AIRCRAFT') { return $null }
    if ($manifest.title -match '^A339X - Lock Highlights(?: \(.+\))?$') { return $script:A339XNames[1] }
    if ($manifest.title -match '^A339X(?: \(.+\))?$') { return $script:A339XNames[0] }
    return $null
}

function Assert-A339XPackage([string]$Path, [string]$Name) {
    if ($Name -notin $script:A339XNames -or (Get-A339XIdentity $Path) -ne $Name) { throw "Unverified Headwind package identity: $Name" }
    $hashes = Get-A339XInventory $Path
    $manifest = Get-Content -LiteralPath (Join-Path $Path 'manifest.json') -Raw | ConvertFrom-Json -AsHashtable
    if (-not $manifest.package_version -or -not $manifest.minimum_game_version -or -not $manifest.ContainsKey('dependencies')) { throw 'Incomplete package manifest.' }
    $layout = Get-Content -LiteralPath (Join-Path $Path 'layout.json') -Raw | ConvertFrom-Json -AsHashtable
    if (-not $layout.content) { throw 'Empty package layout.' }
    $listed = @{}
    foreach ($entry in $layout.content) {
        $relative = ([string]$entry.path).Replace('\', '/')
        if ($relative -match '(^/|:|(^|/)\.\.?(/|$)|//)' -or -not $relative -or $listed.ContainsKey($relative)) { throw "Unsafe or duplicate layout path: $relative" }
        if ($relative -in @('manifest.json', 'layout.json') -or -not $hashes.Contains($relative)) { throw "Invalid layout entry: $relative" }
        if ($entry.size -isnot [ValueType] -or $entry.date -isnot [ValueType] -or $entry.size -lt 0 -or $entry.date -lt 0) { throw "Invalid layout size or timestamp: $relative" }
        if ((Get-Item -LiteralPath (Join-Path $Path $relative)).Length -ne $entry.size) { throw "Layout size mismatch: $relative" }
        $listed[$relative] = $true
    }
    if ($listed.Count + 2 -ne $hashes.Count) { throw 'Layout does not describe every packaged file.' }
    $airplane = 'SimObjects/Airplanes/Headwind_A330neo'
    $required = if ($Name -eq $script:A339XNames[0]) {
        @("$airplane/aircraft.cfg", "$airplane/flight_model.cfg", "$airplane/systems.cfg", "$airplane/engines.cfg", "$airplane/panel/panel.cfg",
          "$airplane/panel/systems.wasm", "$airplane/panel/fbw.wasm", "$airplane/panel/fadec-a339x.wasm", "$airplane/panel/terronnd.wasm", "$airplane/panel/extra-backend-a339x.wasm",
          "$airplane/model/A330_NEO_INTERIOR.xml", 'html_ui/Pages/VCockpit/Instruments/A339X/SD/sd.js')
    } else { @('ModelBehaviorDefs/A339X/LockHighlight.xml') }
    foreach ($file in $required) {
        if (-not $hashes.Contains($file) -or (Get-Item -LiteralPath (Join-Path $Path $file)).Length -eq 0) { throw "Required package file missing or empty: $file" }
    }
    if ($Name -eq $script:A339XNames[0]) {
        foreach ($pattern in @('*/model/*.gltf', '*/model/*.bin', '*.DDS', '*/PFD/pfd.js', '*/ND/nd.js', '*/MCDU/mcdu.js')) {
            if (-not @($hashes.Keys | Where-Object { $_ -like $pattern }).Count) { throw "Required asset class missing: $pattern" }
        }
    }
    return $hashes
}

function Assert-A339XSimulatorClosed {
    if (Get-Process -Name 'FlightSimulator*', 'MicrosoftFlightSimulator*' -ErrorAction SilentlyContinue) { throw 'Close MSFS before deployment or restore. No process was terminated.' }
}

function Get-A339XDeploymentConfig([string]$ConfigPath) {
    $config = Get-Content -LiteralPath (Get-A339XFullPath $ConfigPath) -Raw | ConvertFrom-Json -AsHashtable
    $candidates = @(
        (Join-Path $env:APPDATA 'Microsoft Flight Simulator 2024/UserCfg.opt'),
        (Join-Path $env:LOCALAPPDATA 'Packages/Microsoft.Limitless_8wekyb3d8bbwe/LocalCache/UserCfg.opt')
    ) | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf }
    if (-not $config.userCfgPath) {
        if (@($candidates).Count -ne 1) { throw 'MSFS 2024 configuration is ambiguous. Set userCfgPath in ignored deployment.json.' }
        $config.userCfgPath = @($candidates)[0]
    }
    $cfgPath = Get-A339XFullPath $config.userCfgPath
    if ($cfgPath -notmatch '(Microsoft Flight Simulator 2024|Microsoft\.Limitless_8wekyb3d8bbwe)') { throw 'userCfgPath must identify MSFS 2024.' }
    $matches = [regex]::Matches((Get-Content -LiteralPath $cfgPath -Raw), '(?m)^\s*InstalledPackagesPath\s+"([^"]+)"\s*$')
    if ($matches.Count -ne 1) { throw 'Expected exactly one InstalledPackagesPath in UserCfg.opt.' }
    $root = Get-A339XFullPath $matches[0].Groups[1].Value
    $community = Get-A339XFullPath (Join-Path $root 'Community')
    if (-not (Test-Path -LiteralPath $community -PathType Container)) { throw 'Configured Community directory does not exist.' }
    if (-not $config.communityPath -or (Get-A339XFullPath $config.communityPath) -ne $community) { throw 'communityPath must explicitly match InstalledPackagesPath/Community.' }
    $backup = Get-A339XFullPath $config.backupRoot
    $roots = @($root)
    $otherConfigs = @(
        (Join-Path $env:APPDATA 'Microsoft Flight Simulator/UserCfg.opt'),
        (Join-Path $env:LOCALAPPDATA 'Packages/Microsoft.FlightSimulator_8wekyb3d8bbwe/LocalCache/UserCfg.opt')
    ) | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf }
    foreach ($candidate in @($candidates) + @($otherConfigs)) {
        foreach ($match in [regex]::Matches((Get-Content -LiteralPath $candidate -Raw), '(?m)^\s*InstalledPackagesPath\s+"([^"]+)"\s*$')) { $roots += Get-A339XFullPath $match.Groups[1].Value }
    }
    if ($config.ContainsKey('steamAppManifestPath')) {
        $appManifest = Get-A339XFullPath $config.steamAppManifestPath
        $steamApps = Split-Path $appManifest -Parent
        if ((Split-Path $appManifest -Leaf) -ne 'appmanifest_2537590.acf' -or (Split-Path $steamApps -Leaf) -ne 'steamapps') { throw 'Expected the MSFS 2024 Steam app manifest.' }
        $appText = Get-Content -LiteralPath $appManifest -Raw
        if ($appText -notmatch '(?m)^\s*"appid"\s+"2537590"\s*$' -or $appText -notmatch '(?m)^\s*"StateFlags"\s+"4"\s*$') { throw 'Steam does not report MSFS 2024 fully installed.' }
        $installDirs = [regex]::Matches($appText, '(?m)^\s*"installdir"\s+"([^"\\/:]+)"\s*$')
        if ($installDirs.Count -ne 1 -or $installDirs[0].Groups[1].Value -in @('.', '..')) { throw 'Invalid Steam installation directory.' }
        $gamePath = Get-A339XFullPath (Join-Path (Join-Path $steamApps 'common') $installDirs[0].Groups[1].Value)
        if (-not (Test-Path -LiteralPath (Join-Path $gamePath 'FlightSimulator2024.exe') -PathType Leaf)) { throw 'MSFS 2024 executable missing from Steam installation.' }
        $corePackages = Get-A339XFullPath (Join-Path $gamePath 'Packages')
        if (-not (Test-Path -LiteralPath $corePackages -PathType Container)) { throw 'Steam core Packages directory missing.' }
        $roots += $corePackages
    }
    foreach ($simRoot in $roots) {
        if (Test-A339XInside $backup $simRoot) { throw 'Backups and staging must be outside every discovered simulator package root.' }
    }
    $communityRoots = @($community)
    $community2024 = Join-Path $root 'Community2024'
    if (Test-Path -LiteralPath $community2024) { $communityRoots += Get-A339XFullPath $community2024 }
    return @{ community = $community; communityRoots = $communityRoots; backup = $backup; packageRoots = @($roots | Select-Object -Unique) }
}

function Assert-A339XDestinations($Config, $Packages) {
    $scanRoots = @($Config.community)
    if ($Config.ContainsKey('communityRoots')) { $scanRoots = $Config.communityRoots }
    foreach ($scanRoot in $scanRoots) {
      $null = Get-A339XFullPath $scanRoot
      foreach ($item in Get-ChildItem -LiteralPath $scanRoot -Directory -Force) {
        # An add-on-manager link may hide a duplicate identity, so require deliberate resolution first.
        if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "Community junction requires manual resolution before deployment: $($item.Name)" }
        $restoring = @($Packages | Where-Object { $_.name -eq $item.Name -and $_.ContainsKey('restoreInventory') })
        if ($scanRoot -eq $Config.community -and $restoring.Count -eq 1) { continue }
        $identity = Get-A339XIdentity $item.FullName
        if ($identity -and ($identity -ne $item.Name -or $scanRoot -ne $Config.community)) { throw "Duplicate or renamed A339X package: $($item.FullName)" }
      }
    }
    foreach ($package in $Packages) {
        if ($package.name -notin $script:A339XNames) { throw 'Only verified A339X package names may be replaced.' }
        $destination = Get-A339XFullPath (Join-Path $Config.community $package.name)
        if (Test-Path -LiteralPath $destination) {
            if ($package.ContainsKey('restoreInventory')) { Assert-A339XInventory $destination $package.restoreInventory }
            elseif ((Get-A339XIdentity $destination) -ne $package.name) { throw "Destination identity mismatch: $($package.name)" }
        }
    }
}

function Assert-A339XDependencies($Config, $Packages) {
    foreach ($package in $Packages) {
        $manifest = Get-Content -LiteralPath (Join-Path $package.source 'manifest.json') -Raw | ConvertFrom-Json -AsHashtable
        foreach ($dependency in $manifest.dependencies) {
            if ($dependency.name -notmatch '^[a-zA-Z0-9][a-zA-Z0-9_.-]+$') { throw 'Unsafe dependency name.' }
            $provided = @($Packages | Where-Object name -eq $dependency.name)
            $paths = if ($provided.Count) { @($provided[0].source) } else {
                @(Join-Path $Config.community $dependency.name)
                foreach ($root in $Config.packageRoots) {
                    Join-Path $root $dependency.name
                    foreach ($official in @('Community2024', 'Official', 'Official/OneStore', 'Official/Steam', 'Official2020', 'Official2020/OneStore', 'Official2020/Steam', 'Official2024', 'Official2024/OneStore', 'Official2024/Steam', 'StreamedPackages')) { Join-Path (Join-Path $root $official) $dependency.name }
                }
            }
            $versions = @()
            foreach ($path in @($paths | Select-Object -Unique)) {
                if (Test-Path -LiteralPath (Join-Path $path 'manifest.json')) {
                    $null = Get-A339XFullPath $path
                    $dep = Get-Content -LiteralPath (Join-Path $path 'manifest.json') -Raw | ConvertFrom-Json -AsHashtable
                    $version = $null
                    if (-not [version]::TryParse(($dep.package_version -split '-')[0], [ref]$version)) { throw "Invalid local dependency version metadata: $($dependency.name)." }
                    if ($provided.Count -and $package.name -in $script:A339XNames -and $dependency.name -in $script:A339XNames -and $dep.package_version -ne $manifest.package_version) { throw 'Bundled A339X aircraft and companion package versions differ.' }
                    $versions += $version
                }
            }
            if (-not $versions.Count) { throw "Dependency $($dependency.name) has no locally verified manifest. Deployment blocked." }
            if (-not @($versions | Where-Object { $_ -ge [version]$dependency.package_version }).Count) {
                $found = ($versions | ForEach-Object { $_.ToString() }) -join ', '
                Write-Warning "Dependency metadata mismatch: $($dependency.name) declares $($dependency.package_version); locally verified version: $found. Compatibility is unverified; cross-generation version ordering is not treated as a runtime minimum."
            }
        }
    }
}

function Remove-A339XSelectedPackage([string]$Path, [string]$Community, [string]$Name) {
    $full = Get-A339XFullPath $Path
    if ($Name -notin $script:A339XNames -or $full -ne (Join-Path (Get-A339XFullPath $Community) $Name)) { throw 'Refusing deletion outside the selected package.' }
    if (Test-Path -LiteralPath $full) {
        $null = Get-A339XInventory $full
        Remove-Item -LiteralPath $full -Recurse -Force
    }
}

function Invoke-A339XReplacement($Config, $Packages, [string]$SourceCommit, [string]$BuildId) {
    Assert-A339XSimulatorClosed
    Assert-A339XDestinations $Config $Packages
    $lockId = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($Config.community.ToUpperInvariant())))
    $mutex = [Threading.Mutex]::new($false, "Local\A339XDeployment-$lockId")
    $acquired = $false
    try {
        try { $acquired = $mutex.WaitOne(0) } catch [Threading.AbandonedMutexException] { $acquired = $true }
        if (-not $acquired) { throw 'Another A339X deployment or restore is already running.' }
        $operation = Join-Path $Config.backup ([guid]::NewGuid().ToString())
        $null = New-Item -ItemType Directory -Path $operation
        $recordPath = Join-Path $operation 'deployment-record.json'
        $record = @{ sourceCommit = $SourceCommit; buildId = $BuildId; community = $Config.community; result = 'preparing'; packages = @() }
        foreach ($package in $Packages) {
            $destination = Join-Path $Config.community $package.name
            $stage = Join-Path (Join-Path $operation 'stage') $package.name
            if ($package.source) {
                $null = New-Item -ItemType Directory -Path (Split-Path $stage -Parent) -Force
                Copy-Item -LiteralPath $package.source -Destination $stage -Recurse
                Assert-A339XInventory $stage $package.hashes
            }
            $entry = @{ name = $package.name; destination = $destination; stage = $stage; backup = $null; previousHashes = $null; installedHashes = $package.hashes }
            if (Test-Path -LiteralPath $destination) {
                $entry.previousHashes = Get-A339XInventory $destination
                $entry.backup = Join-Path (Join-Path $operation 'previous') $package.name
                $null = New-Item -ItemType Directory -Path (Split-Path $entry.backup -Parent) -Force
                Copy-Item -LiteralPath $destination -Destination $entry.backup -Recurse
                Assert-A339XInventory $entry.backup $entry.previousHashes
            }
            $record.packages += $entry
        }
        $record.result = 'prepared'
        $record | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $recordPath
        # This pointer is created once; every operation's backups remain outside Community.
        $initial = Join-Path $Config.backup 'initial-deployment-record.txt'
        if (-not (Test-Path -LiteralPath $initial)) { $recordPath | Set-Content -LiteralPath $initial }
        $touched = @()
        try {
            Assert-A339XSimulatorClosed
            Assert-A339XDestinations $Config $Packages
            foreach ($entry in $record.packages) {
                if ($entry.backup) { Assert-A339XInventory $entry.destination $entry.previousHashes }
                elseif (Test-Path -LiteralPath $entry.destination) { throw 'Destination appeared during staging.' }
                $touched += $entry
                Remove-A339XSelectedPackage $entry.destination $Config.community $entry.name
                if ($entry.installedHashes) {
                    Copy-Item -LiteralPath $entry.stage -Destination $entry.destination -Recurse
                    Assert-A339XInventory $entry.destination $entry.installedHashes
                }
            }
            $record.result = 'installed'
            $record | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $recordPath
        } catch {
            $failure = $_
            try {
                foreach ($entry in $touched) {
                    Remove-A339XSelectedPackage $entry.destination $Config.community $entry.name
                    if ($entry.backup) {
                        Copy-Item -LiteralPath $entry.backup -Destination $entry.destination -Recurse
                        Assert-A339XInventory $entry.destination $entry.previousHashes
                    }
                }
                $record.result = 'failed-restored'
            } catch { $record.result = 'rollback-failed'; Write-Warning "Automatic rollback failed. Backups remain at $operation. $($_.Exception.Message)" }
            $record | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $recordPath
            throw $failure
        }
        return $recordPath
    } finally {
        if ($acquired) { $mutex.ReleaseMutex() }
        $mutex.Dispose()
    }
}
