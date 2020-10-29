const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require('path');
const config = require("../../config");

const { host, port, user, pass} = config.default.mail;

var transport = nodemailer.createTransport({
    host: host,
    port: port,
    auth: {
      user: user,
      pass: pass
    }
});

// transport.use('compile', hbs({
//   viewEngine: 'handlebars',
//   viewpath: path.resolve('./src/mail/'),
//   extName: '.html',
//   defaultLayer: false,
// }))


module.exports = transport;