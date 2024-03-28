require("dotenv").config();
const ngrok = require('ngrok');

(async function() {
    await ngrok.connect({
        authtoken: process.env.NGROK_AUTHTOKEN,
        onStatusChange: status => {
            console.log(`Tunnel status: `, status)
        },
        onLogEvent: data => {
            console.log(`Tunnel event: `, data)
        }
    })
    console.log(`Ingress established at: ${ngrok.getUrl()}`);

    const api = ngrok.getApi();

    // const { tunnels } = await api.listTunnels();
    // tunnels.map(tunnel => {
    //     console.log({ tunnel })
    // })

    await api.startTunnel({
        addr: 3003,
        name: "cbs_micro",
        labels: ["edge=edghts_2b9oZEWwtoUuNoCePUJnkvmSzyY"],
        onStatusChange: status => {
            console.log(`Tunnel status: `, status)
        },
        onLogEvent: data => {
            console.log(`Tunnel event: `, data)
        }
    })

    const disconnect = async () => {
        console.warn("Ngrok session close!!");
        await api.stopTunnel("cbs_micro");
        await ngrok.disconnect();
        await ngrok.kill();
    }

    process
        .once("SIGINT", disconnect)
        .once("SIGTERM", disconnect)
  })();

// (async () => {
//     const sessionBuilder = new ngrok.SessionBuilder()

//     const session = await sessionBuilder
//         .authtokenFromEnv()
//         .serverAddr("noted-working-cobra.ngrok-free.app")
//         .connect();

//     const listener = session
//         .httpEndpoint()
//         .listenAndForward("http://localhost:3003")

//     console.log(`Ingress established at: ${listener.url()}`);

//     const disconnect = async () => {
//         console.warn("Ngrok session close!!");
//         await session.close();
//     }

//     process
//         .once("SIGINT", disconnect)
//         .once("SIGTERM", disconnect)
// })()

// ngrok.connect({
//     addr: process.env.PORT || 3003,
//     authtoken_from_env: true,
//     labels: ["edge=edghts_2b9oZEWwtoUuNoCePUJnkvmSzyY"]
// })
// .then(listener => {
//     console.log(`Ingress established at: ${listener.url()}`)
// });

// setInterval(() => {}, 1 << 30);

// const disconnect = async () => {
//     console.warn("Ngrok disconnect!!");
//     await ngrok.disconnect();
// }

// process
//     .once("SIGINT", disconnect)
//     .once("SIGTERM", disconnect)