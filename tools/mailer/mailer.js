'use strict'

const mailer = require('nodemailer')
const cfMailer = require('./config/cf_mailer')

module.exports = function (to, subject, content, callback, from) {
  let smtpTransport = mailer.createTransport({
    service: cfMailer.service,
    auth: {
      user: cfMailer.email,
      pass: cfMailer.password,
    },
  })

  let mail = {
    from: from || 'TRIXGO <noreply.trixgo@gmail.com>',
    to: to,
    subject: subject,
    html: content,
    // attachments: [
    //     {   // utf-8 string as an attachment
    //         filename: './test1.txt',
    //         content: 'hello world!'
    //     },
    //     {   // binary buffer as an attachment
    //         filename: 'text2.txt',
    //         path: `${__dirname}/text2.txt` // stream this file
    //     },
    //     {   // file on disk as an attachment
    //         filename: '01bc9e16217201af5672b64c5f1c088c.jpg',
    //         path: `${__dirname}/01bc9e16217201af5672b64c5f1c088c.jpg` // stream this file
    //     },
    // ]
  }

  smtpTransport.sendMail(mail, function (error, response) {
    console.log({ error, response })
    if (error) {
      if (callback == null || typeof callback == 'undefined') {
      } else {
        callback({ error: true, message: 'send mail error!' })
      }
    } else {
      if (callback == null || typeof callback == 'undefined') {
      } else {
        callback({ error: false, message: 'send mail success!' })
      }
    }

    smtpTransport.close()
  })
}
