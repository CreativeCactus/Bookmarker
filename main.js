const fs = require('fs');

const express = require('express');

const urlToImage = require('url-to-image');

const WebSocketServer = require('websocket').server;
const http = require('http');
 
const app = express();
app.listen(3000, () => {
    console.log(`${new Date()} Frontend is listening on port 3000`);
});

app.use('/img', express.static('img'));
app.get('/', (req, res) => res.sendFile(`${process.cwd()}/client.html`));
app.get('/client.js', (req, res) => res.sendFile(`${process.cwd()}/client.js`));

/*
db   d8b   db .d8888. .d8888. 
88   I8I   88 88'  YP 88'  YP 
88   I8I   88 `8bo.   `8bo.   
Y8   I8I   88   `Y8b.   `Y8b. 
`8b d8'8b d8' db   8D db   8D 
 `8b8' `8d8'  `8888Y' `8888Y'
*/

const server = http.createServer((request, response) => {
    console.log(`${new Date()} Received request for ${request.url}`);
    response.writeHead(404);
    response.end();
});
server.listen(3333, () => {
    console.log(`${new Date()} Server is listening on port 3333`);
});
 
const wss = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});


wss.on('request', (request) => {
    if (!WSSOriginAllow(request.origin)) {
        request.reject();
        console.log(`${new Date()} Connection from origin ${request.origin} rejected.`);
        return;
    }
    const peer = { id: `${Math.random()}`.slice(2) };
    const connection = request.accept('', request.origin);
    console.log(`${new Date()} Connection accepted.`);
    connection.on('message', (message) => {
        if (message.type === 'utf8') {
            console.log(`${peer.id} Received Message: ${JSON.stringify(message.utf8Data)}`);
            
            handleMsg(message.utf8Data).then((res) => {
                if (res)connection.sendUTF(JSON.stringify(res));                
            });
        }
        //  else if (message.type === 'binary') {
        //     console.log(`${peer.id} Received Binary Message of ${message.binaryData.length} bytes`);
        //     connection.sendBytes(message.binaryData);
        // }
    });
    connection.on('close', (reasonCode, description) => {
        console.log(`${new Date()} Peer ${peer.id}:${connection.remoteAddress} disconnected.`);
    });
});

function WSSOriginAllow(origin) {
  // put logic here to detect whether the specified origin is allowed. 
    console.log(`Allow:${origin}`);
    return true;
}

/*
db       .d88b.   d888b  d888888b  .o88b. 
88      .8P  Y8. 88' Y8b   `88'   d8P  Y8 
88      88    88 88         88    8P      
88      88    88 88  ooo    88    8b      
88booo. `8b  d8' 88. ~8~   .88.   Y8b  d8 
Y88888P  `Y88P'   Y888P  Y888888P  `Y88P'
*/

async function handleMsg(msg) {
    const data = JSON.parse(msg);
    const actions = {
        add: async (b) => {
            try {
                const file = `/img/${b64(b)}.png`;
                if (!fs.existsSync(process.cwd() + file)) await urlToImage(b, process.cwd() + file);
                return { head: 'added', 
                    body: {
                        img: file,
                        url: b
                    } };
            } catch (e) {
                console.dir({ e });
                return '';
            }
        }
    };
    return await actions[data.head](data.body);
}

function b64(s) {
    return (new Buffer(s)).toString('base64');
}
