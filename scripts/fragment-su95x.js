const fragmenter = require('@flybywiresim/fragmenter');
const fs = require('fs');

const execute = async () => {
    try {
        const result = await fragmenter.pack({
            packOptions: { splitFileSize: 102_760_448, keepCompleteModulesAfterSplit: false },
            baseDir: './build-su95x/out/headwindsim-aircraft-su100-95',
            outDir: './build-su95x/out/build-modules',
            modules: [{
                name: 'effects',
                sourceDir: './effects'
            }, {
                name: 'html_ui',
                sourceDir: './html_ui'
            }, {
                name: 'ModelBehaviorDefs',
                sourceDir: './ModelBehaviorDefs'
            }, {
                name: 'Textures',
                sourceDir: './SimObjects/Airplanes/Headwind_SU95/texture'
            }, {
                name: 'Texture-Stable',
                sourceDir: './SimObjects/Airplanes/Headwind_SU95/texture.A32NX_Stable'
            }, {
                name: 'Livery',
                sourceDir: './SimObjects/Airplanes/_Headwind_SU95-Livery'
            }, {
                name: 'Sound',
                sourceDir: './SimObjects/Airplanes/Headwind_SU95/sound'
            }, {
                name: 'Sound-AI',
                sourceDir: './SimObjects/Airplanes/Headwind_SU95/soundai'
            }, {
                name: 'Model',
                sourceDir: './SimObjects/Airplanes/Headwind_SU95/model'
            }, {
                name: 'Panels',
                sourceDir: './SimObjects/Airplanes/Headwind_SU95/panel'
            }]
        });
        console.log(result);
        console.log(fs.readFileSync('./build-su95x/out/build-modules/modules.json').toString());
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

execute();
