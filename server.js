"use strict";
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const exphbs  = require('express-handlebars');

app.use(bodyParser.json());
app.engine('handlebars', exphbs({}));
app.set('view engine', 'handlebars');
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
const phoneNumber = process.env.NUMBER;

let calls = {};
let experts = [];

Array.prototype.random = function() {
  return this[Math.floor(Math.random() * this.length)];
};

app.get('/', function (req, res) {
  res.render('index', { phoneNumber, experts: (experts || []).length });
});

app.get('/answer', function (req, res) {
  res.send([
    {
      "action": "talk",
      "voice_name": "Amy",
      "text": "Welcome to Crowd Support."
    },
    {
      "action": "talk",
      "voice_name": "Amy",
      "text": "If you would like to ask a question, please press one. If you would like to register as an expert, please press two."
    },
    {
      "action": "input",
      "timeOut": "60",
      "eventUrl": ["http://crowdsupport.marcusnoble.co.uk/event/response"]
    }
  ]);
});

app.post('/event', function (req, res) {
  console.log(req.body)

  if(req.body.from) {
    calls[req.body.conversation_uuid] = req.body.from;
  }

  res.sendStatus(200);
});

app.post('/event/recording', function (req, res) {
  console.log(`Got a call recording: ${req.body.recording_url}`);
  res.sendStatus(200);
});

app.post('/event/response', function (req, res) {
  if(req.body.dtmf === '1') {
    let expert = experts.random();
    console.log('About to connect to expert: ' + expert + ' from ' + calls[req.body.conversation_uuid]);
    res.send([
      {
        "action": "talk",
        "voice_name": "Amy",
        "text": "OK. Please wait while we try and connect you to an expert."
      },
      {
        "action": "connect",
        "timeout": "120",
        "from": phoneNumber,
        "endpoint": [
          {
            "type": "phone",
            "number": expert
          }
        ]
      },
      {
        "action": "record",
        "beepStart": true,
        "eventUrl": ["http://crowdsupport.marcusnoble.co.uk/event/recording"]
      }
    ]);
  } else if(req.body.dtmf === '2') {
    console.log('Registering expert: ' + calls[req.body.conversation_uuid]);
    experts.push(calls[req.body.conversation_uuid]);

    res.send([{
      "action": "talk",
      "voice_name": "Amy",
      "text": "Thank you. You have now been registered as an expert."
    }]);
  }
});

app.listen(PORT, function () {
  console.log(`Example app listening on port ${PORT}!`);
});