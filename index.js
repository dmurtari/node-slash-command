var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var request = require('request');

var VERIFY_TOKEN = process.env.SLACK_VERIFY_TOKEN;
if (!VERIFY_TOKEN) {
  console.error('SLACK_VERIFY_TOKEN is required');
  process.exit(1);
}
var PORT = process.env.PORT;
if (!PORT) {
  console.error('PORT is required');
  process.exit(1);
}

var app = express();
app.use(morgan('dev'));

app.route('/foxden')
  .get(function (req, res) {
    res.sendStatus(200);
  })
  .post(bodyParser.urlencoded({ extended: true }), function (req, res) {
    if (req.body.token !== VERIFY_TOKEN) {
      console.error('Wrong token sent');
      return res.status(401).send('Invalid token');
    }

    var message = 'Welcome to the Foxden bot, ' + req.body.user_name + '. Start a meeting at https://my.foxden.io!';

    // Handle any help requests
    if (req.body.text === 'help') {
      message = "No help here yet";
    }

    if (req.body.text === 'start') {
      request.post({
        host: 'https://slack.com',
        path: '/api/users.list',
        form: {
          token: process.env.SLACK_AUTH_TOKEN,
          user: req.body.user_id
        }
      }, function(err, response, body) {
        res.json({
          response_type: 'ephemeral',
          err: err,
          resnse: response,
          text: body
        });
      });
    } else {
      res.json({
        response_type: 'ephemeral',
        text: message
      });
    }
  });

app.listen(PORT, function (err) {
  if (err) {
    return console.error('Error starting server: ', err);
  }

  console.log('Server successfully started on port %s', PORT);
});
