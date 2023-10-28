const express = require('express');
const app = express();
const path = require('path');
const { globSync } = require('glob');
const fs = require('fs');

function exitWithError(err) {
    const useage = `node serve.js <site-directory> [port]`;
    console.log(`Error: ${err}`);
    console.log(useage);
    process.exit();
}

if (process.argv.length < 3) {
    exitWithError('No site directory provided.')
}

let PORT = 3000;
if (process.argv.length == 4) {
    PORT = parseInt(process.argv[3])
    if (isNaN(PORT)) {
        exitWithError(`PORT must be a number, got ${PORT}`);
    }
}

const rootDir = path.resolve(process.argv[2]);
if (!fs.existsSync(rootDir)) {
    exitWithError(`No such directory '${rootDir}'`);
}

const templatesDir = path.join(rootDir, "views");
const templatesGlob = path.join(templatesDir, "**/*.ejs");
const partialsGlob = path.join(templatesDir, "partials/**");

app.use(express.static(path.join(rootDir, '/public')));

app.set('view engine', 'ejs');
app.set('views', templatesDir);

const templateFiles = globSync(templatesGlob, { ignore: partialsGlob });
templateFiles.forEach(file => {
    const f = path.parse(file);
    const name = (f.name !== 'index') ? f.name : "";
    const route = "/" + name;
    app.get(route, (_, res) => res.render(f.name));
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));