const ejs = require('ejs');
const { globSync } = require("glob");
const path = require("path");
const fs = require('fs');
const process = require('process');

const build = (siteRootDir, distDir) => {
    const absRootDir = path.resolve(siteRootDir);
    if (!fs.existsSync(absRootDir)) {
        console.log(`No such directory '${absRootDir}'`);
        return false;
    }

    // Start from clean 'dist' directory.
    const absDistDir = path.resolve(distDir);
    if (fs.existsSync(absDistDir)) {
        console.log(`Deleting existing ${absDistDir}...`);
        fs.rmSync(absDistDir, { recursive: true, force: true });
    }
    console.log(`Creating ${absDistDir}...`);
    fs.mkdirSync(absDistDir);

    // Copy everything from 'public' directly to 'dist'.
    // These are static/non-EJS files needed in your site
    // (e.g. CSS files, JS files, image assets).
    const publicDir = path.join(absRootDir, "public");
    if (!fs.existsSync(publicDir)) {
        console.log(`Cannot find '${publicDir}'`);
        return false;
    }
    const publicDirContents = fs.readdirSync(publicDir);
    publicDirContents.forEach(item => {
        const src = path.join(publicDir, item);
        const dst = path.join(absDistDir, item);
        fs.cpSync(src, dst, { recursive: true });
        console.log(`\t${src} -> ${dst}`);
    });

    // Copy all views and partials.
    const templatesDir = path.join(absRootDir, "views");
    if (!fs.existsSync(templatesDir)) {
        console.log(`Cannot find templates directory '${templatesDir}'`);
        return false;
    }

    console.log("Rendering EJS templates...");
    const templatesGlob = path.join(templatesDir, "**/*.ejs");
    const partialsGlob = path.join(templatesDir, "partials/**");
    const templateFiles = globSync(templatesGlob, { ignore: partialsGlob });
    templateFiles.forEach((templateFile) => {
        const f = path.parse(templateFile);
        const dest = path.join(absDistDir, `${f.name}` + ".html");
        console.log(`\t${templateFile} -> ${dest}`);
        ejs.renderFile(templateFile, { building: true }, {}, (err, str) => {
            if (err) {
                console.log(`Failed to render ${templateFile}: ${err}`);
                return false;
            }
            fs.writeFile(dest, str, err => {
                if (err) {
                    console.log(`Failed to write ${dest}: ${err}`);
                    return false;
                }
            });
        });
    });
}

build(process.argv[2], process.argv[3]);
