const express = require('express');
const path = require('path');
const hbs = require('hbs');
require('./db/db');
const Squeak = require('./models/squeak');
const squeakRouter = require('./routers/squeak');

//Define paths
const publicDirectoryPath = path.join(__dirname, '../public');
const viewsPath = path.join(__dirname, '../templates/views');
const partialsPath = path.join(__dirname, '../templates/partials');

const app = express();

//setup handlebars engine and views location
app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);

app.use(express.json());
app.use(squeakRouter);

//Static directory path
app.use(express.static(publicDirectoryPath));

app.get('/', function (req, res) {
  res.render('index', {});
});

module.exports = app;
