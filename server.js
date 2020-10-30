'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var myDB = require('./connection');
var cors = require('cors');

var apiRoutes = require('./routes/api.js');
var fccTestingRoutes = require('./routes/fcctesting.js');
var runner = require('./test-runner');

var app = express();
//For FCC testing purposes
fccTestingRoutes(app);
app.use(cors({origin: '*'}));

app.use('/public', express.static(process.cwd() + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Sample front-end
app.route('/:project/')
  .get(function(req, res) {
    res.sendFile(process.cwd() + '/views/issue.html');
  });

//Index page (static HTML)
app.route('/')
  .get(function(req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

myDB(async client => {
  const myDatabase = await client.db('IssueTracker').collection('issues');


  //Routing for API 
  apiRoutes(app, myDatabase);

  // 404 Not Found Middleware
  app.use(function(req, res, next) {
    res.status(404)
      .type('text')
      .send('Not Found');
  });
});

//Start our server and tests!
app.listen(process.env.PORT || 3000, function() {
  console.log("Listening on port " + (process.env.PORT || 3000));
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function() {
      try {
        runner.run();
      } catch (e) {
        var error = e;
        console.log('Tests are not valid:');
        console.log(error);
      }
    }, 3500);
  }
});

module.exports = app; //for testing
