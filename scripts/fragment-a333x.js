const fragmenter = require('@flybywiresim/fragmenter');
const fs = require('fs');

const execute = async () => {
  try {
    const result = await fragmenter.pack({
      packOptions: { splitFileSize: 102_760_448, keepCompleteModulesAfterSplit: false },
      baseDir: './build-a333x/out/headwindsim-aircraft-a330-300',
      outDir: './build-a333x/out/build-modules',
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
          sourceDir: './SimObjects/Airplanes/Headwind_A330_300/texture',
        },
        {
          name: 'TextureAIB',
          sourceDir: './SimObjects/Airplanes/Headwind_A330_300/texture.AIB',
        },
        {
          name: 'Livery',
          sourceDir: './SimObjects/Airplanes/_Headwind_A330_300-LIVERY',
        },
        {
          name: 'Sound',
          sourceDir: './SimObjects/Airplanes/Headwind_A330_300/sound',
        },
        {
          name: 'Model',
          sourceDir: './SimObjects/Airplanes/Headwind_A330_300/model',
        },
        {
          name: 'Panels',
          sourceDir: './SimObjects/Airplanes/Headwind_A330_300/panel',
        },
      ],
    });
    console.log(result);
    console.log(fs.readFileSync('./build-a333x/out/build-modules/modules.json').toString());
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

execute();
