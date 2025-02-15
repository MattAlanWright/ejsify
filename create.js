const fs = require('fs');
const path = require('path');

const preprocessorContent = `<% if (building) { htmlext = ".html" } else { htmlext = "" } %>`;

const headContent = `<%- include('preproc') %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
</head>
<body>`;

const footerContent = `<footer>
(c) My Website
</footer>
</body>
</html>`;

const navbarContent = `<nav>
    <div>
        My Website
    </div>

    <div>
        <a href="/">Home</a>
        <a href="/about<%= htmlext %>">About</a>
        <a href="/contact<%= htmlext %>">Contact</a>
    </div>
</nav>`;

const aboutContent = `<%- include('partials/head') %>
<%- include('partials/navbar') %>
<h1>About</h1>
<%- include('partials/footer') %>`;

const contactContent = `<%- include('partials/head') %>
<%- include('partials/navbar') %>
<h1>Contact</h1>
<%- include('partials/footer') %>`;

const indexContent = `<%- include('partials/head') %>
<%- include('partials/navbar') %>
<h1>Welcome!</h1>
<%- include('partials/footer') %>`

const generatePartialsList = (dir) => {
    return [
        {
            filepath: path.join(dir, "preproc.ejs"),
            content: preprocessorContent,
        },
        {
            filepath: path.join(dir, "navbar.ejs"),
            content: navbarContent,
        },
        {
            filepath: path.join(dir, "head.ejs"),
            content: headContent,
        },
        {
            filepath: path.join(dir, "footer.ejs"),
            content: footerContent,
        }
    ]
}

const createPartials = (partialsDir) => createFiles(partialsDir, generatePartialsList);

const generateViewsList = (dir) => {
    return [
        {
            filepath: path.join(dir, "about.ejs"),
            content: aboutContent,
        },
        {
            filepath: path.join(dir, "contact.ejs"),
            content: contactContent,
        },
        {
            filepath: path.join(dir, "index.ejs"),
            content: indexContent,
        }
    ]
}

const createViews = (viewsDir) => createFiles(viewsDir, generateViewsList);

const createFiles = (dir, filesListGenerator) => {
    const files = filesListGenerator(dir);
    files.forEach(f => {
        console.log(`Creating ${f.filepath}...`);
        fs.writeFile(f.filepath, f.content, err => {
            if (err) {
                console.error(err);
                return false;
            };
        });
    });
    return true;
}

const create = (dirName) => {
    const absDirPath = path.resolve(dirName);
    if (fs.existsSync(absDirPath)) {
        console.log(`${absDirPath} already exists.`);
        return false;
    }

    console.log(`Creating ${absDirPath}...`);
    fs.mkdirSync(absDirPath, { recursive: true });

    const publicDirPath = path.join(absDirPath, "public");
    console.log(`Creating ${publicDirPath}...`);
    fs.mkdirSync(publicDirPath);

    const viewsDirPath = path.join(absDirPath, "views");
    console.log(`Creating ${viewsDirPath}...`);
    fs.mkdirSync(viewsDirPath);
    if (!createViews(viewsDirPath)) {
        return false;
    }

    const partialsDirPath = path.join(viewsDirPath, "partials");
    console.log(`Creating ${partialsDirPath}...`);
    fs.mkdirSync(partialsDirPath);
    if (!createPartials(partialsDirPath)) {
        return false;
    }

    return true;
};

module.exports.create = create;
