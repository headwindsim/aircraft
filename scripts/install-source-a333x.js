require('dotenv').config();
const fs = require('fs-extra');

const source = process.env.BUILD_DIR_NAME ? 'external/a333x/' + process.env.BUILD_DIR_NAME : 'external/a333x';
console.log('installManifest source is: ' + source);

const installManifest = fs.readJSONSync('./build-a333x/out/headwindsim-aircraft-a330-300/install.json');
installManifest.source = source;
fs.writeJSONSync('./build-a333x/out/headwindsim-aircraft-a330-300/install.json', installManifest);
