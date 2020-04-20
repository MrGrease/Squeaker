const express = require('express');
const path = require('path');
const hbs = require('hbs');
require('./db/db');
const app = express();

//Define paths
const publicDirectoryPath = path.join(__dirname, '../public');
const viewsPath = path.join(__dirname, '../templates/views');
const partialsPath = path.join(__dirname, '../templates/partials');

//setup handlebars engine and views location
app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);

//Static directory path
app.use(express.static(publicDirectoryPath));

app.get('/', function (req, res) {
  res.render('index', {});
});

app.listen(process.env.PORT);
