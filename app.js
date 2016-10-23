require('dotenv').config();
const Nexmo = require('nexmo');
const privateKey = require('fs').readFileSync(__dirname + '/private.key');
const server = require('./server');
const nexmo = new Nexmo({
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET,
    applicationId: process.env.APP_ID,
    privateKey: privateKey
});