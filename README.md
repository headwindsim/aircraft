![Headwind Simulations](https://headwindsim.net/assets/images/headwind-logo-light.png)

# Headwind Simulations - A339X - A330-900neo

[![GitHub latest release version](https://img.shields.io/github/v/release/headwind-msfs/a330-900.svg?style=for-the-badge)](https://github.com/headwind-msfs/a330-900/releases/latest)
[![Github All Releases download count](https://img.shields.io/github/downloads/headwind-msfs/a330-900/total?style=for-the-badge&color=dd6b20)](https://github.com/headwind-msfs/a330-900/releases/latest)
[![GitHub contributors](https://img.shields.io/github/contributors/headwind-msfs/a330-900.svg?style=for-the-badge&color=dd6b20)](https://github.com/headwind-msfs/a330-900/graphs/contributors)

[![Discord](https://img.shields.io/discord/965000103150645258?label=Discord&style=for-the-badge&color=dd6b20)](https://discord.com/invite/headwindsim)

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
.\scripts\dev-env\run.cmd ./scripts/copy_a339x.sh
.\scripts\dev-env\run.cmd ./scripts/copy_a333x.sh
.\scripts\dev-env\run.cmd ./scripts/copy_su95x.sh
```
For Git Bash/Linux:
```shell
./scripts/copy_a339x.sh
./scripts/copy_a333x.sh
./scripts/copy_su95x.sh
```

#### 3. Build all A32NX module by running following command on powershell.

For powershell:
```shell
.\scripts\dev-env\run.cmd ./scripts/build_a339x.sh
.\scripts\dev-env\run.cmd ./scripts/build_a333x.sh
.\scripts\dev-env\run.cmd ./scripts/build_su95x.sh
```
For Git Bash/Linux:
```shell
./scripts/dev-env/run.sh ./scripts/build_a339x.sh
./scripts/dev-env/run.sh ./scripts/build_a333x.sh
./scripts/dev-env/run.sh ./scripts/build_su95x.sh
```

#### 4. The package is now ready to use. Copy the folder "headwind-aircraft-a330-900" to your CommunityPackage folder in MSFS.

## Open source
Open Source Projects contributing to the realisation of this MSFS A330-900 Neo :

Systems, Cockpit, Cockpit texture, Sound: FlyByWire - https://github.com/flybywiresim

Engine Sound: FTSiM+ - https://www.ftsimplus.com

Cockpit 3D parts, learning: Project Mega Pack - https://github.com/Project-Mega-Pack


## License Information

This repository and its contents are dual-licensed, with a unique set of terms applied to the original textual-form source code and the artistic assets, respectively.

### GNU General Public License version 3 (GNU GPLv3)

The original textual-form source code in this repository is licensed under the GNU General Public License version 3 (GNU GPLv3). Compiled artifacts generated from this source code also fall under the GNU GPLv3 license.

A copy of the GNU GPLv3 can be found in the LICENSE file in this repository or [online](https://www.gnu.org/licenses/gpl-3.0.html).

### Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (CC BY-NC 4.0)

The artistic assets within this repository, including models and textures, are licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (CC BY-NC 4.0).

You can view the full text of the CC BY-NC 4.0 license [here](https://creativecommons.org/licenses/by-nc-sa/4.0/).

### Game Content Usage Rules

The Project Mega Pack A330, the FlyByWire Simulations A32NX, and the Headwind Simulations A339X were all created under Microsoft's "Game Content Usage Rules" using assets from Microsoft Flight Simulator 2020. They are neither endorsed by nor affiliated with Microsoft.

### A330neo Model Exception

The A330neo model used in this project is based on the work of Shervin Ahooraei from Project Sky. It is not open source, but we have been granted explicit permission to use it. All rights and credits for this model belong to Shervin Ahooraei. The model cannot be copied, modified, or distributed without his direct permission.

### Disclaimer

We are not affiliated, associated, authorized, endorsed by, or in any way officially connected with the Airbus brand, or any of its subsidiaries or its affiliates.

### Overall

Content within distribution packages built from the sources in this repository are licensed as follows:

- Original source code or compiled artifacts from Headwind Simulations: GNU GPLv3.
- Original 3D assets from Headwind Simulations: CC BY-NC 4.0.
- Assets covered by the "Game Content Usage Rules": Under the license granted by those rules.
- A330neo model: Not open source, used with explicit permission from Shervin Ahooraei of Project Sky.

Please respect these licenses and attributions when using content from this repository.
