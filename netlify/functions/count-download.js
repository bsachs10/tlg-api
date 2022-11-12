const { google } = require("googleapis");
const md5 = require("blueimp-md5");
const dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc') 
var timezone = require('dayjs/plugin/timezone') // dependent on utc plugin


exports.handler = async function (event, context) {
    const { url, title, email } = JSON.parse(event.body);
    try {

        await recordDownload({ url, title, email });
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Success!' }),
        };

    } catch (e) {
        logError('Error logging download request to Google Sheet', e);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Could not log download', error: e }),
        };
    }


}

function logError(msg, data) {
    console.error(msg, data);
    // Timestamp, Type, Description, Details
    appendGoogleSheet('log', [[getCurrentDateAndTimeFormattedForGoogleSheets(), 'ERROR', msg, JSON.stringify(data)]])
}


async function appendGoogleSheet(sheet, dataInRows, spreadsheetId = "15gByrg3FKL6vl-bHXTluOUD-nGeFmgk0jDtcTkEXdKc") {
    const auth = google.auth.fromJSON({
        "type": "authorized_user",
        "client_id": process.env.GOOGLE_CLIENT_ID,
        "client_secret": process.env.GOOGLE_CLIENT_SECRET,
        "refresh_token": process.env.GOOGLE_REFRESH_TOKEN

    });
    const sheets = google.sheets({ version: 'v4', auth });

    return await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: sheet,
        valueInputOption: "USER_ENTERED",
        resource: {
            values: dataInRows,
        },
    });

}

async function recordDownload({ email, title, url }) {

    return await appendGoogleSheet("download_tracking", createArrayForGoogleSheetTracking({ email, title, url }))

}

function createArrayForGoogleSheetTracking({ email, title, url }) {
    // Timestamp, Email, Title,	URL, Hash, Action
    return [[
        getCurrentDateAndTimeFormattedForGoogleSheets(),
        email,
        title,
        url,
        md5(JSON.stringify({ email, title, url })),
        'DOWNLOAD'
    ]];
}


function getCurrentDateAndTimeFormattedForGoogleSheets() {
    dayjs.extend(utc)
    dayjs.extend(timezone)
    dayjs.tz.setDefault("America/New_York");
    return dayjs().format("M/D/YY H:m:s");

};

