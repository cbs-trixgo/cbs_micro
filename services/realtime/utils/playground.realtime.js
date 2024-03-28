// call other service in MOLECULER
let infoUser = await socket.$service.broker.call('users.login', {
 email: _data.data.email,
 password: _data.data.password
});

// emit all socket(listeners)
socket.emit("LOGIN_SUCCESS", { message: 'data from server' });