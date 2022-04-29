[![GitHub latest release version](https://img.shields.io/github/v/release/headwind-msfs/a330-900.svg?style=for-the-badge)](https://github.com/headwind-msfs/a330-900/releases/latest)
[![Github All Releases download count](https://img.shields.io/github/downloads/headwind-msfs/a330-900/total?style=for-the-badge)](https://github.com/headwind-msfs/a330-900/releases/latest)
[![GitHub contributors](https://img.shields.io/github/contributors/headwind-msfs/a330-900.svg?style=for-the-badge)](https://github.com/headwind-msfs/a330-900/graphs/contributors)

[![Discord](https://img.shields.io/discord/965000103150645258.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.com/invite/UxWy8C6kgv)

# Headwind A339X - A330-900neo

Welcome to the Headwind A339X Project! This is a open source project to create a free Airbus A330-900neo in Microsoft Flight Simulator and is mainly based on the FlyByWire A32NX. If you only want to use the aircraft in MSFS please download the Addon here: https://flightsim.to/file/18198/airbus-a330-900neo-conversion

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
.\scripts\dev-env\run.cmd ./scripts/build.sh
```
For Git Bash/Linux:
```shell
./scripts/dev-env/run.sh ./scripts/build.sh
```

#### 4. The package is now ready to use. Copy the folder "headwind-aircraft-a330-900" to your CommunityPackage folder in MSFS.

## Open source
Open Source Projects contributing to the realisation of this MSFS A330-900 Neo :

Systems, cockpit, cockpit texture, sound : FlyByWire - https://github.com/flybywiresim
FBW integration : Tyler58546 - https://github.com/tyler58546/pmp-a330-fbw-compatibility
Cockpit 3D parts, learning : Project Mega Pack - https://github.com/Project-Mega-Pack

## Licences

The original contents of this repository are DUAL LICENSED. Original textual-form source code in this file is licensed under the GNU General Public License version 3.

Creative Commons License Artistic Assets (Models, Textures) are licenced under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.

You are free to:
    Share — copy and redistribute the material in any medium or format
    Adapt — remix, transform, and build upon the material

The licensor cannot revoke these freedoms as long as you follow the license terms.
asures that legally restrict others from doing anything the license permits.

Microsoft Flight Simulator © Microsoft Corporation. The Project Mega Pack A330 was created under Microsoft's "Game Content Usage Rules" using assets from Microsoft Flight Simulator 2020, and it is not endorsed by or affiliated with Microsoft.

Microsoft Flight Simulator © Microsoft Corporation. The FlyByWire Simulations A32NX was created under Microsoft's "Game Content Usage Rules" using assets from Microsoft Flight Simulator, and it is not endorsed by or affiliated with Microsoft.

We are not affiliated, associated, authorized, endorsed by, or in any way officially connected with the Airbus brand, or any of its subsidiaries or its affiliates.
