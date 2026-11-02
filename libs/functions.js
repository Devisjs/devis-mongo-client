"use strict";

const { MongoClient } = require("mongodb");
let database;

// Runs an operation on args.db (or the last connected database), then closes it unless args.close is false.
function run(args, done, operations) {
    if (args.db === undefined) {
        args.db = database;
    }
    const operation = operations[args.type];
    if (operation === undefined) {
        return done("unknown type " + args.type, null);
    }
    let result;
    operation(args.db, args.collection && args.db.collection(args.collection))
        .then((res) => {
            result = res;
            if (args.close === undefined || args.close === true) {
                return args.db.client.close();
            }
        })
        .then(() => done(null, result), (err) => done(err, null));
}

function connect(args, done) {
    const client = new MongoClient(args.url);
    client.connect()
        .then(() => {
            database = client.db();
            done(null, database);
        })
        .catch((err) => done(err, null));
}

function close(args, done) {
    if (args.db === undefined) {
        args.db = database;
    }
    args.db.client.close()
        .then(() => done(null, "end connection"))
        .catch((err) => done(err, null));
}

function find(args, done) {
    if (args.type === undefined) args.type = "many";
    run(args, done, {
        one: (db, col) => col.findOne(args.query, args.options),
        many: (db, col) => col.find(args.query, args.options).toArray()
    });
}

function index(args, done) {
    run(args, done, {
        // ensureIndex was removed from the driver; it was an alias of createIndex.
        ensureIndex: (db, col) => col.createIndex(args.indexFields, args.params),
        createIndex: (db, col) => col.createIndex(args.indexFields, args.params),
        ifExist: (db, col) => col.indexExists(args.index),
        getAllIndexes: (db, col) => col.indexes()
    });
}

function insert(args, done) {
    run(args, done, {
        one: (db, col) => col.insertOne(args.data, args.params),
        many: (db, col) => col.insertMany(args.data, args.params)
    });
}

function del(args, done) {
    run(args, done, {
        one: (db, col) => col.deleteOne(args.query),
        many: (db, col) => col.deleteMany(args.query)
    });
}

function update(args, done) {
    run(args, done, {
        one: (db, col) => col.updateOne(args.query, args.data),
        many: (db, col) => col.updateMany(args.query, args.data)
    });
}

function createCollection(args, done) {
    run(Object.assign(args, { type: "create" }), done, {
        create: (db) => db.createCollection(args.collection)
    });
}

function dropCollection(args, done) {
    run(Object.assign(args, { type: "drop" }), done, {
        drop: (db, col) => col.drop()
    });
}

function aggregate(args, done) {
    run(Object.assign(args, { type: "aggregate" }), done, {
        aggregate: (db, col) => col.aggregate(args.aggQuery).toArray()
    });
}

module.exports = {
    index: index,
    connect: connect,
    close: close,
    insert: insert,
    del: del,
    update: update,
    find: find,
    createCollection: createCollection,
    dropCollection: dropCollection,
    aggregate: aggregate
}
