require('dotenv').config();
const fs = require('fs-extra');

const source = process.env.BUILD_DIR_NAME ? 'external/a339x/' + process.env.BUILD_DIR_NAME : 'external/a339x';
console.log('installManifest source is: ' + source);

const installManifest = fs.readJSONSync('./build-a339x/out/headwindsim-aircraft-a330-900/install.json');
installManifest.source = source;
fs.writeJSONSync('./build-a339x/out/headwindsim-aircraft-a330-900/install.json', installManifest);
