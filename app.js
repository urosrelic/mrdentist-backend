const express = require('express');
const bodyParser = require('body-parser');
const router = require('./routes/index');
const session = require('express-session');

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(
  session({
    secret: 'your secret key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // set to true if using https
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware
app.use(router);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
