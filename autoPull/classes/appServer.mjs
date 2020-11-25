import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import * as http from 'http';

export class ExpressServer {
    constructor() {
        this.MAIN_URL = "";
        this.app = express();
        this.app.use(cors());
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
    }
    buildApp(endpoint,response) {
        this.app.get(this.MAIN_URL + endpoint, async function(req, res) {
            return response(req,res,"get");
        });
        this.app.post(this.MAIN_URL + endpoint, async function(req, res) {
            return response(req,res,"post");
        });
    }

    post(endpoint,response) {
        this.app.post(this.MAIN_URL + endpoint, async function(req, res) {
            return response(req,res);
        });
    }

    startApp(port,cb) {
        var server = http.createServer(this.app);
        server.listen(port, () => {
            console.log('Express server listening on port ' + port);
            cb(true);
        })
        server.on('error', function(e) {
            console.log("Express error::", e.message);
            cb(false);
        });
    }
}

const expS = new ExpressServer();
export default expS;