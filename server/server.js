const express = require('express');
const app = express();
const http = require ('http').Server(app);
const path = require('path');

// require in conspectio npm package and invoke
// const conspectioServer = require('conspectio');
// lib in progress, use the lib server conspectioServer.js
const conspectioServer = require('./../lib/server/conspectioServer.js');
conspectioServer(http);

// currently don't have a CDN conspectio client lib, need this server to host the file
app.use(express.static(path.join(`${__dirname}/../dist`)));

// serve up demo client side files
app.use(express.static(path.join(`${__dirname}/../client`)));

app.get('/', (req,res) => {
	res.sendFile(path.resolve('client/index.html'));
});

http.listen(3000, function(){
	console.log('listening on 3000');
});

module.export = http;