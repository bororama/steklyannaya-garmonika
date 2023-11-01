const express = require('express');
const server = express();

require('dotenv').config()


server.use(express.static('public'));

server.get('*', (req, res) => {
    res.status(404).send('Not found');
})

server.listen(8080, () => {
    console.log('server listening on 8080...');
    console.log(`host ${process.env.HOST_ADDRESS}`)
})

/**************************/
/**************************/
