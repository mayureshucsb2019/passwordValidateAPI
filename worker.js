'use strict'

// importing packages
const bcrypt = require("bcrypt");
const restify = require("restify");

// Below function is used to check validity of the password
function checkPassword(line){
    const flags = [0,0,0] //caps, small, number
    if(line.length >= 6){
        for(let i=0;i<line.length;i++){
            //condition for caps
            if( 65<=line.charCodeAt(i) && line.charCodeAt(i)<=90 ){
                flags[0] = 1;
            }
            else if( 97<=line.charCodeAt(i) && line.charCodeAt(i)<=122 ){
                flags[1] = 1;
            }
            else if( 48<=line.charCodeAt(i) && line.charCodeAt(i)<=57 ){
                flags[2] = 1;
            }
            else{
                //nothing, maybe some special character. check not asked
            }
        }
    }
    if(flags[0]&&flags[1]&&flags[2]){
        //console.log("Valid Password!");
        const rounds = Math.trunc(Math.random())*100;
        const hashedPassword = bcrypt.hashSync(line,rounds);
        //console.log(hashedPassword)
        return {status: 0,hash: hashedPassword};
    }
    else{
        //console.log("Invalid password of valid length!");
        return {status: 1,hash: "Invalid"};
    }
}


// setting config files
const config = {
    name: "worker-api",
    hostname: "http://localhost",
    version: "0.0.1",
    env: process.env.NODE_ENV || "development",
    port: process.env.PORT || 4001,
}

const server = restify.createServer({
    name: config.name,
    version: config.version,
    url: config.hostname,
});

// getting restify plugins to parse
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

server.get("/validate/:pText", function(req, res, next){
    //console.log(req.params);
    const passStat = checkPassword(req.params.pText)
    console.log(passStat.hash)
    res.send(passStat);
});

server.listen(config.port, function(){
    console.log("%s listening at %s", server.name, server.url);
});