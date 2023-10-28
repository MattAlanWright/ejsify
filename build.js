const ejs = require('ejs');
const { globSync } = require("glob");
const path = require("path");
const fs = require('fs');
const process = require('process');

function exitWithError(err, cleanup) {
    const useage = `node build.js <site-directory>`;
    console.log(`Error: ${err}`);
    console.log(useage);

    if (cleanup) {
        cleanup();
    }

    process.exit();
}

if (process.argv.length < 3) {
    exitWithError('No site directory provided.')
}

const rootDir = path.resolve(process.argv[2]);
if (!fs.existsSync(rootDir)) {
    exitWithError(`No such directory '${rootDir}'`);
}

// Start from a clean 'dist' directory
console.log("Cleaning 'dist' folder...");
const distDir = path.join(rootDir, "dist");
const deleteDist = () => {
    if (fs.existsSync(distDir)) {
        fs.rmSync(distDir, { recursive: true, force: true });
    }
}
deleteDist();
fs.mkdirSync(distDir);

const publicDir = path.join(rootDir, "public");
if (!fs.existsSync(publicDir)) {
    exitWithError(`Cannot find 'public' directory (${publicDir})`, deleteDist);
}

// Copy everything from 'public' directly to 'dist'.
// These are static/non-EJS files needed in your site
// (e.g. CSS files, JS files, image assets).
console.log("Copying contents of 'public'...");
const publicDirContents = fs.readdirSync(publicDir);
publicDirContents.forEach((item) => {
    const src = path.join(publicDir, item);
    const dst = path.join(distDir, item);
    fs.cpSync(src, dst, { recursive: true });
    console.log(`\t${src} -> ${dst}`);
});

const templatesDir = path.join(rootDir, "views");
if (!fs.existsSync(templatesDir)) {
    exitWithError(`Cannot find 'views' directory (${templatesDir})`, deleteDist);
}

console.log("Rendering EJS templates...");
const templatesGlob = path.join(templatesDir, "**/*.ejs");
const partialsGlob = path.join(templatesDir, "partials/**");
const templateFiles = globSync(templatesGlob, { ignore: partialsGlob });
templateFiles.forEach((templateFile) => {
    const f = path.parse(templateFile);
    const dest = path.join(distDir, `${f.name}` + ".html");
    console.log(`\t${templateFile} -> ${dest}`);
    ejs.renderFile(templateFile, {}, {}, (err, str) => {
        if (err) {
            exitWithError(`Failed to render ${templateFile}: ${err}`, deleteDist);
        }
        fs.writeFile(dest, str, err => {
            if (err) {
                exitWithError(`Failed to write ${dest}: ${err}`, deleteDist);
            }
        });
    });
});
