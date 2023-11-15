require('dotenv').config();
const fs = require('fs-extra');

const source = process.env.BUILD_DIR_NAME ? 'external/su95x/' + process.env.BUILD_DIR_NAME : 'external/su95x';
console.log('installManifest source is: ' + source);

const installManifest = fs.readJSONSync('./build-su95x/out/headwindsim-aircraft-su100-95/install.json');
installManifest.source = source;
fs.writeJSONSync('./build-su95x/out/headwindsim-aircraft-su100-95/install.json', installManifest);
