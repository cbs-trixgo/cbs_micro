exports.sendNotificationviaOneSignal = function (data) {
  console.log({ env: process.env.NODE_ENV })
  if (process.env.NODE_ENV === 'development') {
    return
  }

  let headers = {
    'Content-Type': 'application/json; charset=utf-8',
    Authorization: 'NDFlZGFiOTMtYjM1My00ZWIyLTg4MmItYmNhMTBiMGUxYjQz',
  }

  let options = {
    host: 'onesignal.com',
    port: 443,
    path: '/api/v1/notifications',
    method: 'POST',
    headers: headers,
  }

  let https = require('https')
  let req = https.request(options, function (res) {
    res.on('data', function (data) {
      try {
        console.log('Response:', data)
        // console.log(JSON.parse(data));
      } catch (error) {
        console.error(error)
      }
    })
  })

  req.on('error', function (e) {
    console.error('ERROR: (noti.send.js)')
    console.error(e)
  })

  req.write(JSON.stringify(data))
  req.end()
}

// let message = {
//     // app_id: "79acfc09-966a-48f5-a9ea-44d90410014f",
//     app_id: "bb20e3c3-e4b2-458a-b8e0-35955876073f",
//     contents: {"en": "English Message"},
//     headings: {"en": "HEADING ENGLISH"},
//     include_player_ids: ["0840a5a3-3e0b-4439-838e-fb13ba6c48ce"],
//     big_picture: 'https://trixgo.com/template/images/logo.png'
// };

// sendNotificationviaOneSignal(message)
