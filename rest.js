'use strict'

// importing packages
const mysql = require("mysql");
const restify = require("restify");

const restifyclient = require("restify-clients");

// creating linkt ot listen from worker
const worker = restifyclient.createJSONClient({
    url:"http://localhost:4001/"
});

// setting config files
const config = {
    name: "rest-api",
    hostname: "http://localhost",
    version: "0.0.1",
    env: process.env.NODE_ENV || "development",
    port: process.env.PORT || 4000,
    db: {
        get: mysql.createPool({
            host: 'localhost',
            user: "root",
            database: "node-complete",
            password: "AfMs2018!"
        })
    }
}

// getting connection with data base
const connection = config.db.get;

// creating table if not already created and making connection
connection.getConnection(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var qry= "CREATE TABLE IF NOT EXISTS `jobs`(`id` INT(11) NOT NULL AUTO_INCREMENT,"+
             "`status` VARCHAR(255) NOT NULL DEFAULT 'queued',"+
             "`timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,"
             + "`result` VARCHAR(255),"+
             "PRIMARY KEY (`id`));";
    connection.query(qry, function (err, result) {
      if (err) throw err;
      console.log("Table created");
    });
  });

// creating server to listen to
const server = restify.createServer({
    name: config.name,
    version: config.version,
    url: config.hostname,
});

// getting restify plugins to parse
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

server.get("/jobs/:id", function(req, res, next){
    //console.log(req.params.id);
    connection.query("SELECT status, result FROM jobs WHERE id="+String(req.params.id), function(error, results, fields){
        if(error) throw error;
        res.send(results);
    });
});

server.post("/jobs", function(req,res,next){
    console.log("Post request received from client.");
    console.log(req.body)
    let dataId = 0
    connection.query("INSERT INTO jobs () VALUES ()",function(error, result, fields){
        if(error) throw error;
        dataId = result.insertId;
         
        console.log("Below is the result of insert query........................");
        
        console.log("DataID is: "+dataId+" input is:"+req.body.input);
        
        worker.get("/validate/:"+req.body.input, function(err,req, res, obj){
            console.log("get method eexuted")
            if(err) throw err;
            const passCheck = obj;
            console.log("Putting passCheck below...")
            //console.log(res.body);
            console.log(obj);
            const msg = passCheck.status ==0 ? "sucess" : "error";
            connection.query("UPDATE jobs SET result='"+passCheck.hash+"',status='"+msg+"' WHERE id="+dataId,function(error, result, fields){
            if(error) throw error;
            console.log("status evaluated and updated");
            });
        });
        
        
    });
    
});

server.listen(config.port, function(){
    console.log("%s listening at %s", server.name, server.url);
});