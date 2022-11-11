import fetch from 'node-fetch';

exports.handler = = async function (event, context) {
    const eventBody = JSON.parse(event.body)

    return {
        statusCode: 200,
        body: JSON.stringify({
            eventBody,
        }),
    }
}