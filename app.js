const Express = require("express");
const BodyParser = require("body-parser");
const FeedbackStore = require("./crud.js");
const path = require("path");

var app = Express();
app.use(Express.static('public'));
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.post("/add_feedback", async (request, response) => {
    let cb = function (added_feedback) {
        if (added_feedback <= 0) {
            return response.status(500).send({ status: "FAILURE" });
        }
        response.send({ status: "SUCCESS" });
    };
    await FeedbackStore.add_feedback(request.body, cb);
});

app.get("/get_feedbacks/", async (req, response) => {
    let lookback_seconds = +(req.query.lookback_seconds);
    lookback_seconds = (lookback_seconds === undefined || lookback_seconds <= 0) ? 100 : req.query.lookback_seconds;
    let limit = +(req.query.limit);
    limit = (limit === undefined || limit <= 0) ? 100 : req.query.limit;

    let cb = function (feedbacks) {
        response.send(feedbacks);
    };
    await FeedbackStore.get_feedbacks(cb, lookback_seconds, limit);
});

app.listen(process.env.port || 4000, () => {
    // MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
    //     if (error) {
    //         throw error;
    //     }
    //     database = client.db(DATABASE_NAME);
    //     collection = database.collection("people");
    //     console.log("Connected to `" + DATABASE_NAME + "`!");
    //     console.log("Connected to `" + DATABASE_NAME + "`!");
    // });
    console.log("Started listening !!");
});
