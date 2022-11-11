
exports.handler = async function (event, context) {
    const eventBody = JSON.parse(event.body)

    return {
        statusCode: 500,
        body: JSON.stringify(eventBody),
    }
}