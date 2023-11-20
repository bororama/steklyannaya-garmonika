const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

require('dotenv').config()


app.use(express.static('public'));
app.use('/socket.io', express.static( './node_modules/socket.io/client-dist'))

app.get('*', (req, res) => {
    res.status(404).send('And nothing was found!');
})

io.on('connection', (socket) => {
    console.log("a brotha connected");
})

server.listen(8080, () => {
    console.log('server listening on 8080...');
    console.log(`host ${process.env.HOST_ADDRESS}`)
})


/**************************/
/**************************/
