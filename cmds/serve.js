const express = require('express');
const path = require('path');
const { globSync } = require('glob');
const fs = require('fs');

const serve = (rootDir, port) => {
    const absRootDir = path.resolve(rootDir);
    if (!fs.existsSync(absRootDir)) {
        console.log(`No such directory '${absRootDir}'`);
        return false;
    }

    const templatesDir = path.join(absRootDir, "views");
    const templatesGlob = path.join(templatesDir, "**/*.ejs");
    const partialsGlob = path.join(templatesDir, "partials/**");

    const app = express();
    app.use(express.static(path.join(rootDir, '/public')));

    app.set('view engine', 'ejs');
    app.set('views', templatesDir);

    const templateFiles = globSync(templatesGlob, { ignore: partialsGlob });
    templateFiles.forEach(file => {
        const f = path.parse(file);
        const name = (f.name !== 'index') ? f.name : "";
        const route = "/" + name;
        app.get(route, (_, res) => res.render(f.name, { building: false }));
    });

    app.listen(port, () => console.log(`Listening on port ${port}`));
}

module.exports.serve = serve;
