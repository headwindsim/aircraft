const fragmenter = require('@flybywiresim/fragmenter');
const fs = require('fs');

const execute = async () => {
    try {
        const result = await fragmenter.pack({
            packOptions: { splitFileSize: 102_760_448, keepCompleteModulesAfterSplit: false },
            baseDir: './hdw-su95x-liveries/out/headwindsim-su95x-livery-package',
            outDir: './hdw-su95x-liveries/out/build-modules',
            modules: [{
                name: 'Aeroflot',
                sourceDir: './SimObjects/Airplanes/Headwind_SU95-Aeroflot'
            }, {
                name: 'Armavia',
                sourceDir: './SimObjects/Airplanes/Headwind_SU95-Armavia'
            }, {
                name: 'Azimuth',
                sourceDir: './SimObjects/Airplanes/Headwind_SU95-Azimuth'
            }, {
                name: 'Interjet',
                sourceDir: './SimObjects/Airplanes/Headwind_SU95-Interjet'
            }, {
                name: 'RedWings',
                sourceDir: './SimObjects/Airplanes/Headwind_SU95-RedWings'
            }, {
                name: 'Yakutia',
                sourceDir: './SimObjects/Airplanes/Headwind_SU95-Yakutia'
            }]
        });
        console.log(result);
        console.log(fs.readFileSync('./hdw-su95x-liveries/out/build-modules/modules.json').toString());
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

execute();
