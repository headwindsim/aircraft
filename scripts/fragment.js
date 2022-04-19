const fragmenter = require('@flybywiresim/fragmenter');
const fs = require('fs');

const execute = async () => {
    try {
        const result = await fragmenter.pack({
            baseDir: './headwind-a330neo',
            outDir: './build-modules',
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
                sourceDir: './SimObjects/Airplanes/Headwind_A330neo/TEXTURE'
            }, {
                name: 'Sound',
                sourceDir: './SimObjects/Airplanes/Headwind_A330neo/sound'
            }, {
                name: 'Model',
                sourceDir: './SimObjects/Airplanes/Headwind_A330neo/model'
            }, {
                name: 'Panels',
                sourceDir: './SimObjects/Airplanes/Headwind_A330neo/panel'
            }, {
                name: 'ContentInfo',
                sourceDir: './ContentInfo'
            }]
        });
        console.log(result);
        console.log(fs.readFileSync('./build-modules/modules.json').toString());
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

execute();
