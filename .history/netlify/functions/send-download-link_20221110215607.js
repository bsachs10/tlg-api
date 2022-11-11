// Require:
var postmark = require("postmark");

// Send an email:
var client = new postmark.ServerClient("POSTMARK-SERVER-API-TOKEN-HERE");

client.sendEmail({
    "From": "sender@example.com",
    "To": "recipient@example.com",
    "Subject": "Test",
    "TextBody": "Hello from Postmark!"
});



exports.handler = async function (event, context) {
    const eventBody = JSON.parse(event.body)

    return {
        statusCode: 200,
        body: JSON.stringify(eventBody),
    }
}