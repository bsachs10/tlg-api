export const handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)

    return {
        statusCode: 200,
        body: JSON.stringify({
            eventBody,
        }),
    }
}