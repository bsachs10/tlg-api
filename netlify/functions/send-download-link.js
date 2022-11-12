const postmark = require("postmark");
const { google } = require("googleapis");
const md5 = require("blueimp-md5");


exports.handler = async function (event, context) {
    const { url, title, email } = JSON.parse(event.body);

    try {
        await sendEmail({url, title, email});

        try {

            await recordDownloadRequest({ url, title, email });
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Success!' }),
            };        

        } catch (e) {
            logError('Error logging download request to Google Sheet', e);
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Email sent, but not logged', error: e }),
            };
        }
    } catch (e) {
        logError('Error sending email', e);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Email could not be sent', error: e }),
        };
    }

   
}

function logError(msg, data) {
    console.error(msg, data);
    // Timestamp, Type, Description, Details
    appendGoogleSheet('log', [[getCurrentDateAndTimeFormattedForGoogleSheets(), 'ERROR', msg, JSON.stringify(data)]])
}

function getProxyUrl({ title, url, email }) {
    try {
        const encodedData = LinkEncoder.encode({ title, url, email });
        return 'https://www.thelandinggroup.com/all-rise/toolkit/download/?data=' + encodedData;
    } catch (e) {
        logError('Could not encode download URL for transmission', e);
        return url;
    }
}


function sendEmail({ url, title, email }) {
    const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);
    const emailPayload = {
        TemplateAlias: 'send-download-link',
        From: "mail@thelandinggroup.com",
        To: email,
        TemplateModel: {
            url: getProxyUrl({url, title, email}),
            title,
            product_url: "https://www.thelandinggroup.com/all-rise",
            product_name: "All Rise"
        }
    };

    console.log('email', emailPayload);

    return Promise.resolve(emailPayload);
    // return Promise.reject('Fake Error');
    // return client.sendEmailWithTemplate(emailPayload);

}
    
async function appendGoogleSheet(sheet, dataInRows, spreadsheetId = "15gByrg3FKL6vl-bHXTluOUD-nGeFmgk0jDtcTkEXdKc") {
    const auth = google.auth.fromJSON({
        "type": "authorized_user",
        "client_id": process.env.GOOGLE_CLIENT_ID,
        "client_secret":  process.env.GOOGLE_CLIENT_SECRET,
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

async function recordDownloadRequest({ email, title, url }) {
    
    return await appendGoogleSheet("download_tracking", createArrayForGoogleSheetTracking({ email, title, url }))

}

function createArrayForGoogleSheetTracking({email, title, url}) {
    // Timestamp, Email, Title,	URL, Hash, Action
    return [[
        getCurrentDateAndTimeFormattedForGoogleSheets(),
        email,
        title,
        url,
        md5(JSON.stringify({email, title, url})),
        'REQUEST'
    ]];
}


const LinkEncoder = {
    encode: ({ title, email, url }) => {
        const encoderFunc = typeof (buf) !=='undefined' && buf.toString || btoa;
        return encodeURIComponent(encoderFunc(JSON.stringify({ title, email, url })));
    },
    decode: (encodedString) => {
        const decoderFunc = typeof (abuf) !== 'undefined' && abuf.toString || atob;
        return (JSON.parse(decoderFunc(decodeURIComponent(encodedString))));
    }
};

function getCurrentDateAndTimeFormattedForGoogleSheets() {
    const date = new Date();
    return `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
};

