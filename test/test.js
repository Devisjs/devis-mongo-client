"use strict";
const test = require("node:test");
const assert = require("node:assert");
const devis = require("../index");

const url = process.env.MONGO_URL || "mongodb://localhost:27017/devis_test";

function call(action, args) {
    return new Promise((resolve, reject) => {
        devis.call({ role: "mongodb", action }, args, (err, res) => (err ? reject(err) : resolve(res)));
    });
}

const connect = () => call("connect", { url });

test.before(async () => {
    await connect();
    await call("dropCollection", { collection: "books", close: false }).catch(() => {});
    await call("createCollection", { collection: "books", close: false });
    await call("insert", { collection: "books", type: "many", data: [{ title: "a", n: 1 }, { title: "b", n: 2 }, { title: "c", n: 3 }] });
});

// 1.x closed the connection before the query answered, so a default find returned nothing.
test("find returns documents even when it closes the connection", async () => {
    await connect();
    const docs = await call("find", { collection: "books", query: {}, options: { sort: { n: 1 } } });
    assert.deepStrictEqual(docs.map((d) => d.title), ["a", "b", "c"]);
});

test("the connection is closed after an operation unless close is false", async () => {
    await connect();
    await call("find", { collection: "books", type: "one", query: { title: "a" } });
    await assert.rejects(call("find", { collection: "books", query: {} }));
});

test("update, delete and aggregate act on the stored documents", async () => {
    await connect();
    const updated = await call("update", { collection: "books", type: "one", query: { title: "a" }, data: { $set: { n: 10 } }, close: false });
    assert.strictEqual(updated.modifiedCount, 1);

    const deleted = await call("delete", { collection: "books", type: "many", query: { n: { $lt: 3 } }, close: false });
    assert.strictEqual(deleted.deletedCount, 1);

    const sum = await call("aggregate", { collection: "books", aggQuery: [{ $group: { _id: null, total: { $sum: "$n" } } }] });
    assert.strictEqual(sum[0].total, 13);
});

test("index operations create and report indexes", async () => {
    await connect();
    const name = await call("index", { collection: "books", type: "createIndex", indexFields: { title: 1 }, close: false });
    assert.strictEqual(name, "title_1");
    assert.strictEqual(await call("index", { collection: "books", type: "ifExist", index: "title_1" }), true);
});

test("an unknown type is reported instead of never answering", async () => {
    await connect();
    await assert.rejects(call("find", { collection: "books", type: "all" }), /unknown type all/);
    await call("close", {});
});
