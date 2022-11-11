
exports.handler = async function (event, context) {
    const eventBody = JSON.parse(event.body)

    return {
        statusCode: 100,
        body: JSON.stringify(eventBody),
    }
}