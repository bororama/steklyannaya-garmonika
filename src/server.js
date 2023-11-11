const express = require('express');
const app = express();
const http = require('htpp');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

require('dotenv').config()


app.use(express.static('public'));

app.get('*', (req, res) => {
    res.status(404).send('Not found');
})

app.listen(8080, () => {
    console.log('server listening on 8080...');
    console.log(`host ${process.env.HOST_ADDRESS}`)
})

io.on('connection', (socket) => {
    console.log("a brotha connected");
})

/**************************/
/**************************/
