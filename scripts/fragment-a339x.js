const fragmenter = require('@flybywiresim/fragmenter');
const fs = require('fs');

const execute = async () => {
  try {
    const result = await fragmenter.pack({
      version: require('./fragmenter_version').version,
      packOptions: { splitFileSize: 102_760_448, keepCompleteModulesAfterSplit: false },
      baseDir: './build-a339x/out/headwindsim-aircraft-a330-900',
      outDir: './build-a339x/out/build-modules',
      modules: [
        {
          name: 'effects',
          sourceDir: './effects',
        },
        {
          name: 'html_ui',
          sourceDir: './html_ui',
        },
        {
          name: 'ModelBehaviorDefs',
          sourceDir: './ModelBehaviorDefs',
        },
        {
          name: 'Textures',
          sourceDir: './SimObjects/Airplanes/Headwind_A330neo/texture',
        },
        {
          name: 'TextureAIB',
          sourceDir: './SimObjects/Airplanes/Headwind_A330neo/texture.AIB',
        },
        {
          name: 'Livery',
          sourceDir: './SimObjects/Airplanes/_Headwind_A330neo-LIVERY',
        },
        {
          name: 'Sound',
          sourceDir: './SimObjects/Airplanes/Headwind_A330neo/sound',
        },
        {
          name: 'Model',
          sourceDir: './SimObjects/Airplanes/Headwind_A330neo/model',
        },
        {
          name: 'Panels',
          sourceDir: './SimObjects/Airplanes/Headwind_A330neo/panel',
        },
        {
          name: 'ContentInfo',
          sourceDir: './ContentInfo',
        },
      ],
    });
    console.log(result);
    console.log(fs.readFileSync('./build-a339x/out/build-modules/modules.json').toString());
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

execute();
