require('dotenv').config();
const fs = require('fs-extra');

const source = process.env.BUILD_DIR_NAME ? 'external/su95x-liveries/' + process.env.BUILD_DIR_NAME : 'external/su95x-liveries';
console.log('installManifest source is: ' + source);

const installManifest = fs.readJSONSync('./hdw-su95x-liveries/out/headwindsim-su95x-livery-package/install.json');
installManifest.source = source;
fs.writeJSONSync('./hdw-su95x-liveries/out/headwindsim-su95x-livery-package/install.json', installManifest);
