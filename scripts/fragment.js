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
                name: 'CUSTOMIZE',
                sourceDir: './CUSTOMIZE'
            }, {
                name: 'ModelBehaviorDefs',
                sourceDir: './ModelBehaviorDefs'
            }, {
                name: 'Textures',
                sourceDir: './SimObjects/AirPlanes/Headwind_A330neo/TEXTURE'
            }, {
                name: 'Sound',
                sourceDir: './SimObjects/AirPlanes/Headwind_A330neo/sound'
            }, {
                name: 'Model',
                sourceDir: './SimObjects/AirPlanes/Headwind_A330neo/model'
            }, {
                name: 'Panels',
                sourceDir: './SimObjects/AirPlanes/Headwind_A330neo/panel'
            }, {
                name: 'MarketplaceData',
                sourceDir: './MarketplaceData'
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
