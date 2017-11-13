"use strict";
let mongoDriver = require("devis");
let mongofunctions = require("./libs/functions");

mongoDriver.push({
    role: "mongodb",
    action: "connect"
}, mongofunctions.connect);


mongoDriver.push({
    role: "mongodb",
    action: "index"
}, mongofunctions.index);

mongoDriver.push({
    role: "mongodb",
    action: "close"
}, mongofunctions.close);

mongoDriver.push({
    role: "mongodb",
    action: "insert"
}, mongofunctions.insert);

mongoDriver.push({
    role: "mongodb",
    action: "find"
}, mongofunctions.find);

mongoDriver.push({
    role: "mongodb",
    action: "aggregate"
}, mongofunctions.aggregate);

mongoDriver.push({
    role: "mongodb",
    action: "update"
}, mongofunctions.update);

mongoDriver.push({
    role: "mongodb",
    action: "delete"
}, mongofunctions.del);

mongoDriver.push({
    role: "mongodb",
    action: "dropCollection"
}, mongofunctions.dropCollection);

mongoDriver.push({
    role: "mongodb",
    action: "createCollection"
}, mongofunctions.createCollection);

module.exports = mongoDriver;//for local use

//using protocoles
//unix socket:
/*
mongoDriver.listen({
    path:"/tmp/mongodb.sock"
});
*/ 

//named pipes:

/*
mongoDriver.listen({path: "\\\\\.\\pipe\\mongodb"});
*/

//tcp:
/*
mongoDriver.listen({host: "127.0.0.1" port : 3030, type:"tcp"});
*/

//http:
/*
mongoDriver.listen({host: "127.0.0.1" port : 3030, type:"http"});
*/