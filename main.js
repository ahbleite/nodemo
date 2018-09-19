const uuidv1 = require("uuid/v1");
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = require('http').Server(app);
var https = require('https');
const port = 3000;
const helmet = require('helmet');
const endpoint = process.env.ELASTIC_ENDPOINT;

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
	res.setHeader('Access-Control-Allow-Methods', 'POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
	next();
});

//pre-flight requests
app.options('*', function(req, res) {
	res.send(200);
});

server.listen(port, (err) => {
	if (err) {
		throw err;
	}
	/* eslint-disable no-console */
    console.log("ELASTIC_ENDPOINT: " + endpoint);
	console.log('Node Endpoints working :)');
});

module.exports = server;

app.post('/demotfs/created/', (req, res) => {
    performRequest(endpoint, "/tfscreated/", req.body, function(data, path){
        console.log(path);
        res.status(200);
        res.send('working');
        res.end();
    });
});

app.post('/demotfs/updated/', (req, res) => {
    performRequest(endpoint, "/tfsupdated/", req.body, function(data, path){
        console.log(path);
        res.status(200);
        res.send('working');
        res.end();
    })
});


function performRequest(host, endpoint, data, success) {
        var dataString = JSON.stringify(data);

        var headers = {
            'Content-Type': 'application/json',
            'Content-Length': dataString.length
        };
        
        var options = {
            host: host,
            path: endpoint + uuidv1().toString(),
            method: "POST",
            headers: headers
        };
    
        var req = https.request(options, function (res) {
                res.setEncoding('utf-8');
    
                var responseString = '';
    
                res.on('data', function (data) {
                    responseString += data;
                });
    
                res.on('end', function () {
                    console.log("Response: " + responseString);
                    var responseObject = JSON.parse(responseString);
                    success(responseObject, options.path);
                });
            });
            
        req.on('error', function(err) {
            console.log("Error");
            req.end();
        });
    
        req.write(dataString);
        req.end();
    }