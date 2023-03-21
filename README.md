![Headwind Simulations](https://headwindsim.net/assets/images/headwind-logo-light.png)

# Headwind Simulations - A339X - A330-900neo

[![GitHub latest release version](https://img.shields.io/github/v/release/headwind-msfs/a330-900.svg?style=for-the-badge)](https://github.com/headwind-msfs/a330-900/releases/latest)
[![Github All Releases download count](https://img.shields.io/github/downloads/headwind-msfs/a330-900/total?style=for-the-badge)](https://github.com/headwind-msfs/a330-900/releases/latest)
[![GitHub contributors](https://img.shields.io/github/contributors/headwind-msfs/a330-900.svg?style=for-the-badge)](https://github.com/headwind-msfs/a330-900/graphs/contributors)

[![Discord](https://img.shields.io/discord/965000103150645258?label=Discord&style=for-the-badge)](https://discord.com/invite/headwindsim)

Welcome to the Headwind Simulations A339X Project! This is a open source project to create a free Airbus A330-900neo in Microsoft Flight Simulator and is based on the FlyByWire System A32NX. If you only want to use the aircraft in MSFS please download the Addon here: https://headwindsim.net/a339x.html

### A330neo

 ```
 Model       A330-941
 Engine      RR TRENT 7000
 APU         GTCP331-350C
 FMS         Honeywell Release P5A
 FWC Std.    H2F9C
 RA          Honeywell ALA-52B
 TAWS        Honeywell EGPWS
 ACAS        Honeywell TPA-100B
 ATC         Honeywell TRA-67A
 MMR         Honeywell MMR
 WXR         Honeywell RDR-4000
 ```
The present aircraft setup is either being simulated or targeted. It's important to keep in mind that this setup could be altered in the future as the A339X initiative develops and transforms.


## How to build
Make sure docker are isntalled. Prefferably with WSL2 backend.

#### 1. First, run following command on powershell. This will install the A32NX docker images and node modules.

For powershell:
```shell
.\scripts\dev-env\run.cmd ./scripts/setup.sh
```
For Git Bash/Linux:
```shell
./scripts/dev-env/run.sh ./scripts/setup.sh
```
#### 2. As next step we will copy the original source files and copy-over our source files.

For powershell:
```shell
.\scripts\dev-env\run.cmd ./scripts/copy.sh
```
For Git Bash/Linux:
```shell
./scripts/dev-env/run.sh ./scripts/copy.sh
```

#### 3. Build all A32NX module by running following command on powershell.

For powershell:
```shell
.\scripts\dev-env\run.cmd ./scripts/build_a339x.sh
```
For Git Bash/Linux:
```shell
./scripts/dev-env/run.sh ./scripts/build_a339x.sh
```

#### 4. The package is now ready to use. Copy the folder "headwind-aircraft-a330-900" to your CommunityPackage folder in MSFS.

#### (Optional) If you want to use the MSFS Dev Tools you can run the following command (after build completed) to copy the files to the PackageSources.

For powershell:
```shell
.\scripts\dev-env\run.cmd ./scripts/package.sh
```
For Git Bash/Linux:
```shell
./scripts/dev-env/run.sh ./scripts/package.sh
```


## Open source
Open Source Projects contributing to the realisation of this MSFS A330-900 Neo :

Systems, Cockpit, Cockpit texture, Sound: FlyByWire - https://github.com/flybywiresim

Engine Sound: FTSiM+ - https://www.ftsimplus.com/´

Cockpit 3D parts, learning: Project Mega Pack - https://github.com/Project-Mega-Pack


## Licences

The original contents of this repository are DUAL LICENSED. Original textual-form source code in this file is licensed under the GNU General Public License version 3 (GNU GPLv3).

Creative Commons License Artistic Assets (Models, Textures) are licenced under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (CC BY-NC 4.0).

Microsoft Flight Simulator © Microsoft Corporation.

The Project Mega Pack A330 was created under Microsoft's "Game Content Usage Rules" using assets from Microsoft Flight Simulator 2020, and it is not endorsed by or affiliated with Microsoft.

The FlyByWire Simulations A32NX was created under Microsoft's "Game Content Usage Rules" using assets from Microsoft Flight Simulator, and it is not endorsed by or affiliated with Microsoft.

The Headwind Simulations A339X was created under Microsoft's "Game Content Usage Rules" using assets from Microsoft Flight Simulator, and it is not endorsed by or affiliated with Microsoft.

The contents of distribution packages built from the sources in this repository are therefore licensed as follows:

- in the case of original source code from Headwind Simulations or compiled artifacts generated from it, under GPLv3.
- in the case of original 3D assets from Headwind Simulations, under CC BY-NC 4.0.
- in the case of assets covered by the "Game Content Usage Rules", under the license granted by those rules.

We are not affiliated, associated, authorized, endorsed by, or in any way officially connected with the Airbus brand, or any of its subsidiaries or its affiliates.