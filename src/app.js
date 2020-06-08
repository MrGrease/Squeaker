const express = require('express');
const path = require('path');
const hbs = require('hbs');
require('./db/db');

const squeakRouter = require('./routers/squeak');
const userRouter = require('./routers/user');

//Define paths
const publicDirectoryPath = path.join(__dirname, '../public');
const viewsPath = path.join(__dirname, '../templates/views');
const partialsPath = path.join(__dirname, '../templates/partials');
const cookieParser = require('cookie-parser');
const app = express();

//setup handlebars engine and views location
app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);
hbs.registerHelper('extractType', function (type) {
  if (type == 1) {
    return true;
  } else {
    return false;
  }
});
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(squeakRouter);
app.use(userRouter);

//Static directory path
app.use(express.static(publicDirectoryPath));

app.get('/', function (req, res) {
  res.render('index', {});
});

//Create user
module.exports = app;
