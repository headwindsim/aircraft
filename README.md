# Headwind A330-900neo for MSFS

This is the main repository hosting the source code of the freeware A330-900neo for MSFS. If you only want to use the aircraft in MSFS please use this package : https://flightsim.to/file/18198/airbus-a330-900neo-conversion
If you want to contribute pull this repository and drag & drop the HeadwindA330neo.xml over fspackagetool.exe

## How to build
Make sure docker are isntalled. Prefferably with WSL2 backend.

- First, run following command on powershell. This will install the A32NX docker images and node modules.

For powershell:
```shell
.\scripts\dev-env\run.cmd ./scripts/setup.sh
```
For Git Bash/Linux:
```shell
./scripts/dev-env/run.sh ./scripts/setup.sh
```
- Build all A32NX module by running following command on powershell. This isntall A32NX modules to PackageSources.

For powershell:
```shell
.\scripts\dev-env\run.cmd ./scripts/build.sh
```
For Git Bash/Linux:
```shell
./scripts/dev-env/run.sh ./scripts/build.sh
```

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
