import * as express from 'express'

class App {
    public express;

    constructor () {
        this.express = express();
        this.mountRoutes();
    }

    private mountRoutes() : void {
        const router = express.Router();

        this.express.use(express.static('public'));
        this.express.use('/socket.io', express.static( './node_modules/socket.io/client-dist'));

    }
}

export default new App().express
