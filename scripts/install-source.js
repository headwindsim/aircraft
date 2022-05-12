require('dotenv').config();
const fs = require('fs-extra');

const source = process.env.BUILD_DIR_NAME ? 'external/a339x/' + process.env.BUILD_DIR_NAME : 'external/a339x';
console.log('installManifest source is: ' + source);

const installManifest = fs.readJSONSync('./headwind-aircraft-a330-900/install.json');
installManifest.source = source;
fs.writeJSONSync('./headwind-aircraft-a330-900/install.json', installManifest);