const express = require('express');
const app = express();
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "views"));

app.get('/', (req, res) => {
    const randomNumber = Math.floor(Math.random() * 10);
    res.render('index', { number: randomNumber });
});

app.listen(8080, () => console.log("Listening on port 8080"));