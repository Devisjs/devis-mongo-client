# Devis mongo client
 <img  src="https://avatars3.githubusercontent.com/u/21971184?v=4&amp;s=200" href="http://devisjs.surge.sh" width="250" />

>A data storage plugin for Devisjs

<p align="center">
  <a href="https://www.npmjs.com/package/devis-mongo-client"><img src="https://img.shields.io/npm/v/devis-mongo-client.svg" alt="Version"></a>
  <a href="https://github.com/Devisjs/devis-mongo-client/actions/workflows/ci.yml"><img src="https://github.com/Devisjs/devis-mongo-client/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
</p>

This module supports the majority of necessary features for using your MongoDB database.


## Install

Node.js 22 or later is required. Devis is a peer dependency, so install both:

```bash
$ npm install --save devis
$ npm install --save devis-mongo-client
```

## Supported functions 

* Connect to the database :
    * Syntax :
    ```javascript
    .call({role:"mongodb", action:"connect"},{url:mongodb_url},callback);
    ```
    * Example :
     ```javascript
    .call({
		role: "mongodb",
		action: "connect"
        }, { url: "mongodb://localhost:27017/foo" },callback);
    ``` 
    
* Create a collection : 
    * Syntax :
    ```javascript
    .call({role:"mongodb", action:"createCollection"},{collection:collection},callback);
    ```
* Drop a collection : 
    * Syntax :
    ```javascript
    .call({role:"mongodb", action:"dropCollection"},{collection:collection},callback);
    ``` 
    
* Find data :
    * Syntax :
    ```javascript
    .call({role:"mongodb", action:"find"},{collection:collection, type:type, query: query, options: options},callback);
    ```
    *type* : one or many (default : many);
   
    * Examples :  
        * Example 1 : 
        ```javascript
        //close is true by default, but if you don't wanan close the connection you should give false as argument 
        .call({role:"mongodb",action:"find"},{collection:"foo", type : "one", query:{"Acronym" : "L"},close:false},callback);
        ``` 
        * Example 2 : 
        ```javascript
        call({ role: "mongodb", action: "find" }, { type: "many", collection: "foo",query:{Name:"3"}, options: { projection: { "Acronym": 0, _id: 0 } } },callback);
        ```
* Indexes :
    * Create Index : 
        * Syntax :
        ```javascript
        .call({role:"mongodb", action:"index"},{collection:collection, type:type, indexFields: indexFields, params: params},callback);
        ```
        *type* : createIndex (ensureIndex is kept as an alias).
    * check index if exist : 
        * Syntax :
        ```javascript
        .call({role:"mongodb", action:"index"},{collection:collection, type:"ifExist", index: index},callback);
        ```
    * get indexes of a given collection : 
        * Syntax : 
        ```javascript
        .call({role:"mongodb", action:"index"},{collection:collection, type:"getAllIndexes"},callback);
        ```
    * Example :
    ```javascript
    .call({role:"mongodb",action:"index"},{collection:"foo", type:"ifExist",index:["_id_","Acronym_1"]},callback);
    ```
* Insert data :
    * Syntax :
    ```javascript
    .call({role:"mongodb", action:"insert"},{collection:collection, type:type, data: data, params: params},callback);
    ```
    *type* : one or many.
    * Example :
    ```javascript
    let data = [
        {Value: "1",Name: "foo", Acronym:"foo1"}, 
        {Value: "2",Name: "bar", Acronym:"bar1"}];
    .call({ role: "mongodb", action: "insert" },{ type: "many",collection: "foo", data: data },callback);
    ```
* Delete data :
    * Syntax :
    ```javascript
    .call({role:"mongodb", action:"delete"},{collection:collection, type:type, query: query},callback);
    ```
    *type* : one or many.
    * Example :
    ```javascript
    .call({role:"mongodb",action:"delete"},{type:"one", collection:"foo",query:{Value: "1"}},callback);
    ```
* Update data :
    * Syntax :
    ```javascript
    .call({role:"mongodb", action:"update"},{collection:collection, type:type, query: query, data: data},callback);
    ```
    *type* : one or many. `data` must use update operators such as `$set`.
    * Example :
    ```javascript
    let queryOr={
	    $or:[{Value: "1"},{Value:"2"}]};
    let newData={$set: { Name: "foobar"}};
    .call({role:"mongodb", action:"update"},{ type: "many", collection: "foo",query:queryOr, data:newData},callback);
    ```
* Aggregate functions :
    * Syntax :
    ```javascript
    .call({role:"mongodb", action:"aggregate"},{collection:collection, aggQuery: aggQuery},callback);
    ```
    * Example : 
    ```javascript
    let aggQuery = [
            { "$match": { "date": "29.05.2017"} },
            {
                "$group": {
                    "_id": { "Key": "$Key", "date": "$date"},
                    "count": { "$sum": 1 }
            }
        }];
    .call({ role: "mongodb", action: "aggregate" }, { collection: "Production",aggQuery:aggQuery },callback);
    ```
## Example

With Devis 4, `call` returns a Promise when no callback is given:

```javascript
const devis = require("devis").plug("devis-mongo-client");

async function main() {
    await devis.call({ role: "mongodb", action: "connect" }, { url: "mongodb://localhost:27017/shop" });
    await devis.call({ role: "mongodb", action: "insert" }, { collection: "books", type: "many", data: [{ title: "Dune" }, { title: "Hyperion" }], close: false });
    const books = await devis.call({ role: "mongodb", action: "find" }, { collection: "books", query: {} });
    console.log(books.map((book) => book.title)); // [ 'Dune', 'Hyperion' ]
}

main().catch((err) => console.error(err));
```

With Devis 3, pass a callback as last argument instead: `devis.call(pattern, args, (err, result) => { ... })`.

## Closing connections

Every action except `connect` closes the connection when it is done, unless `close: false` is passed. Pass `close: false` to chain several actions on one connection, then call `close`.

An unknown `type` is reported to the callback as an error.

## Upgrading from 1.x

* Node.js 22 or later and Devis 3 or 4 are required. Devis is now a peer dependency.
* The plugin uses the MongoDB driver 7. Results are the driver's own: for example `insert` returns `{ acknowledged, insertedId }` and `update` returns `{ matchedCount, modifiedCount }`.
* `connect` URLs must include the database name, for example `mongodb://localhost:27017/foo`.
* Fixed: `find`, `index`, `update` and `delete` closed the connection before the query answered; `delete` with `type: "many"` and `createCollection` always failed.
