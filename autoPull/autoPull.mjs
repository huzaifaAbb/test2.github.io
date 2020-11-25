import expS from "./classes/appServer.mjs"
import { exec } from "child_process";

const config = {
    username: 'EduAir94',
    pass: '/"DtE6fedNS@{3/^'
}

let repo = "elixir-labs-bootstrap.git";
let cmd = `git pull`;

const PORT = 2100;

async function execute() {
    var myShellScript = exec(`cd .. && git pull && npm install`);
    myShellScript.stdout.on('data', (data)=>{
        console.log("Pulling",data); 
    });
    myShellScript.stderr.on('data', (data)=>{
        console.error(data);
    });
}

expS.startApp(PORT,() => {
    expS.post("/auto-pull-998",(req,res) => {
        const body = req.body;
        console.log(body);
        //if(body.ref == 'refs/heads/master') {
            console.log(body);
            execute();
        //}
        res.json("Received");
    })
})



