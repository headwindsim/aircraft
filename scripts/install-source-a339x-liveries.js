require('dotenv').config();
const fs = require('fs-extra');

const source = process.env.BUILD_DIR_NAME ? 'external/a339x-liveries/' + process.env.BUILD_DIR_NAME : 'external/a339x-liveries';
console.log('installManifest source is: ' + source);

const installManifest = fs.readJSONSync('./hdw-a339x-liveries/out/headwindsim-a339x-livery-package/install.json');
installManifest.source = source;
fs.writeJSONSync('./hdw-a339x-liveries/out/headwindsim-a339x-livery-package/install.json', installManifest);
