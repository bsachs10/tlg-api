// Require:
const postmark = require("postmark");

// Send an email:
const client = new postmark.ServerClient("f6ad730f-af41-4b27-a1e1-75d04a6432a5");




exports.handler = async function (event, context) {
    const { url, filename, title, email } = JSON.parse(event.body);

    const emailPayload = {
        TemplateAlias: 'send-download-link',
        From: "mail@thelandinggroup.com",
        To: email,
        TemplateModel: {
            url, filename, title
        }
    };

    console.log('email', emailPayload);


    try {
        await client.sendEmailWithTemplate(emailPayload); 
    } catch (e) {
        thr
    }


    return {
        statusCode: 200,
        body: JSON.stringify({message: 'Success!'}),
    }
}