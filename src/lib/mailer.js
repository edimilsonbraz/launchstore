const nodemailer = require('nodemailer')

module.exports = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "735d3027722fd2",
      pass: "4f20161aaca75b"
    }
  });

  