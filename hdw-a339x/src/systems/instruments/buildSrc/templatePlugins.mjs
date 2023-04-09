import { join } from 'path';
import instrumentTemplate from '@flybywiresim/rollup-plugin-msfs';
import { Directories } from './directories.mjs';

export function getTemplatePlugin({ name, config, imports = [] }) {
    return instrumentTemplate({
        name,
        elementName: `a32nx-${name.toLowerCase()}`,
        config,
        imports,
        outputDir: join(Directories.root, 'hdw-a339x/out/headwindsim-aircraft-a330-900/html_ui/Pages/VCockpit/Instruments/A339X'),
    });
}