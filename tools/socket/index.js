exports.sendDataToMultilSocketsOfListUser = function ({ listUserConnected, arrReceiver, data, event, io }) {
    // console.log('sendDataToMultilSocketsOfListUser: ', listUserConnected, event, arrReceiver)

    if(!listUserConnected || !event  || !io) return;
    if(!arrReceiver || !arrReceiver.length) return;

    arrReceiver.forEach(userID => {
        // console.log({ userID })
        if(listUserConnected[userID]){
            let listSocket = listUserConnected[userID].sockets;
            // console.log({ [userID]: listSocket })

            if(listSocket && listSocket.length){
                let listIDSend = [];

                listSocket.forEach(socketID => {
                    if(!listIDSend.includes(socketID)){
                        // console.log({ socketID, event });
                        io.to(`${socketID}`).emit(event, data);
                        listIDSend.push(socketID);
                    }
                })
            }

        }
   })
};
