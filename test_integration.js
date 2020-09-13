
const FeedbackStore = require("./crud.js");

async function crud() {
    try {

        await FeedbackStore.add_feedback({ someAmazingParam: "value2" }, console.log);
        await FeedbackStore.get_feedbacks(console.log);
    } catch (e) {
        console.error(e);
    } finally {
        // await client.close();
    }
}

crud().catch(console.error);
