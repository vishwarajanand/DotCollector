const MongoClient = require("mongodb").MongoClient;

const CONNECTION_URL = "mongodb+srv://dot-collector:dot-collector@dot-collector.gr3ic.mongodb.net/dot-collector?retryWrites=true&w=majority";
const DATABASE_NAME = "dot-collector";
const COLLECTION_NAME = "dot-collector";

let client = new MongoClient(CONNECTION_URL);
let database, collection;
let initiatialized = false;

async function init_mongo(retries_left = 3) {
    if (initiatialized) return;
    if (retries_left <= 0) return;
    try {
        client = new MongoClient(CONNECTION_URL);
        await client.connect();
        database = client.db(DATABASE_NAME);
        collection = database.collection(COLLECTION_NAME);
        initiatialized = true;
        console.log(" !! Mongo Initialized SUCCESSFUL !! ");
    } catch (e) {
        initiatialized = false;
        console.error(e);
        console.log(" !! Mongo Initialization FAILED !! ");
    }
    await init_mongo(retries_left - 1);
}

const get_feedbacks = async function (cb, lookback_seconds = 10000, limit = 10000) {
    try {
        await init_mongo();
        const query = { timestamp: { $gt: (new Date().getTime() - lookback_seconds * 1000) } };
        const options = {
            sort: { timestamp: -1 },
            limit: limit,
            projection: { _id: 1, timestamp: 1, body: 1 },
        };
        let feedbacks = [];
        return await collection.find(query, options).toArray(function (err, data) {
            if (err) throw err;
            //console.log(data);
            // feedbacks = feedbacks.concat(data);
            cb(data);
        });
    }
    catch (e) {
        console.error(e);
        cb([]);
    }
}

const add_feedback = async function (body = {}, cb, delay_in_seconds = 0) {
    try {
        await init_mongo();
        let feedback = {};
        feedback.timestamp = (new Date()).getTime() + delay_in_seconds;
        feedback.body = body;
        let result = await collection.insertOne(feedback);
        cb(result.insertedCount);
    }
    catch (e) {
        console.error(e);
        cb(-1);
    }
}

module.exports = {
    get_feedbacks, add_feedback
}
