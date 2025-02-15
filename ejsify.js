const { program } = require('commander');
const { create } = require('./create');
const { serve } = require('./serve');

program
    .name('ejsify')
    .description('EJS-based static site generator.')
    .version('0.1.0');

program
    .command('create')
    .description('Create website skeleton.')
    .argument('<name>', 'Root directory name.')
    .action(name => create(name));

program
    .command('serve')
    .description('Serve website locally.')
    .argument('<root>', 'Site root directory.')
    .option('-p, --port <number>', 'Serve on this port.', 8000)
    .action((root, options) => serve(root, options.port));

program.parse();