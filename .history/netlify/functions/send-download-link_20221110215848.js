// Require:
var postmark = require("postmark");

// Send an email:
var client = new postmark.ServerClient("f6ad730f-af41-4b27-a1e1-75d04a6432a5");

client.sendEmailWithTemplate({
    TemplateId: 'send-download-link',
    From: "mail@thelandinggroup.com",
    To: "to@example.com",
    TemplateModel: { company: "ActiveCampaign" }
}); 

client.sendEmail({
    "From": "mail@thelandinggroup.com",
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