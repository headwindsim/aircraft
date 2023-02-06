const fragmenter = require('@flybywiresim/fragmenter');
const fs = require('fs');

const execute = async () => {
    try {
        const result = await fragmenter.pack({
            packOptions: { splitFileSize: 102_760_448, keepCompleteModulesAfterSplit: false },
            baseDir: './hdw-a339x/out/headwindsim-aircraft-a330-900',
            outDir: './hdw-a339x/out/build-modules',
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
                sourceDir: './SimObjects/Airplanes/Headwind_A330neo/texture'
            }, {
                name: 'TextureABB',
                sourceDir: './SimObjects/Airplanes/Headwind_A330neo/texture.ABB'
            }, {
                name: 'TextureAIB',
                sourceDir: './SimObjects/Airplanes/Headwind_A330neo/texture.AIB'
            }, {
                name: 'TextureCFGBEACH',
                sourceDir: './SimObjects/Airplanes/Headwind_A330neo/texture.CFGBEACH'
            }, {
                name: 'TextureCFGISLAND',
                sourceDir: './SimObjects/Airplanes/Headwind_A330neo/texture.CFGISLAND'
            }, {
                name: 'TextureCFGSEA',
                sourceDir: './SimObjects/Airplanes/Headwind_A330neo/texture.CFGSEA'
            }, {
                name: 'TextureCRL',
                sourceDir: './SimObjects/Airplanes/Headwind_A330neo/texture.CRL'
            }, {
                name: 'TextureDAL',
                sourceDir: './SimObjects/Airplanes/Headwind_A330neo/texture.DAL'
            }, {
                name: 'TextureHFY',
                sourceDir: './SimObjects/Airplanes/Headwind_A330neo/texture.HFY'
            }, {
                name: 'TextureSTAR',
                sourceDir: './SimObjects/Airplanes/Headwind_A330neo/texture.STAR'
            }, {
                name: 'TextureTAP',
                sourceDir: './SimObjects/Airplanes/Headwind_A330neo/texture.TAP'
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
        console.log(fs.readFileSync('./hdw-a339x/out/build-modules/modules.json').toString());
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

execute();