let FCM             = require('fcm-notification');
let CBS_CONFIG_FCM 	= require('./config.json'); //prod 
let fcm             = new FCM(CBS_CONFIG_FCM)

// WORKED
exports.sendMessage = function ({ title, description, arrayRegistrationID, body }) {
	console.log(`run: sendMessage...........`)
	return new Promise(resolve => {
		let tokens 	= Array.isArray(arrayRegistrationID) ? arrayRegistrationID : [arrayRegistrationID]
		let row 	= JSON.stringify(body)
		if(!title){
			title = 'CBS - TRIXGO'
		}
		let mapMessage = {
			data: {    //This is only optional, you can send any data
				row: row
			},
			notification: {
				title,
				body: description
			},
			// android: {
			// 	notification: {
			// 	  icon: 'https://scontent-sin6-2.xx.fbcdn.net/v/t1.6435-9/184539644_3035990490062142_8582086631965464607_n.jpg?_nc_cat=102&ccb=1-3&_nc_sid=09cbfe&_nc_ohc=QxqJP6l8frYAX80xA7r&tn=H5o88mkSDLq3aEYN&_nc_ht=scontent-sin6-2.xx&oh=a48e898dc09772508f5674c61a410439&oe=60D27AB0',
			// 	  color: '#f1f1f1',
			// 	},
			// },
		};
		fcm.sendToMultipleToken(mapMessage, tokens, function (err, response) {
			if (err) {
				return ({
					error : true,
					message : 'unable_to_send_message'
				});
			} else {
				console.log(response);
				return resolve({
					error: false,
					message: response
				});
			}
		});
	
	})
}