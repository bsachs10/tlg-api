// Require:
const postmark = require("postmark");

// Send an email:
var client = new postmark.ServerClient("f6ad730f-af41-4b27-a1e1-75d04a6432a5");




exports.handler = async function (event, context) {
    const eventBody = JSON.parse(event.body)

    return {
        statusCode: 200,
        body: JSON.stringify(eventBody),
    }
}