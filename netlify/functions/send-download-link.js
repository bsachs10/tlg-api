const postmark = require("postmark");
const { google } = require("googleapis");
const md5 = require("blueimp-md5");
const dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone') // dependent on utc plugin


exports.handler = async function (event, context) {
    const { url, title, email, isMobile } = JSON.parse(event.body);
    const IP = event.headers['x-nf-client-connection-ip'];
    console.log('Request from ' + IP);
    try {
        await sendEmail({url, title, email});

        try {
            await recordDownloadRequest({ url, title, email, IP, isMobile });
            return respondWith('Success'); 

        } catch (error) {
            logError('Error logging download request to Google Sheet', error);
            respondWith({ message: 'Email sent, but not logged', error });
            
        }
    } catch (error) {
        logError('Error sending email', error);
        respondWith({ message: 'Email could not be sent', error }, 500);
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

    // return Promise.resolve(emailPayload);
    // return Promise.reject('Fake Error');
    return client.sendEmailWithTemplate(emailPayload);

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

async function recordDownloadRequest({ email, title, url, IP, isMobile }) {
    
    return await appendGoogleSheet("download_tracking", createArrayForGoogleSheetTracking({ email, title, url, IP, isMobile }))

}

function createArrayForGoogleSheetTracking({ email, title, url, IP, isMobile }) {
    // Timestamp, Email, IP, isMobile, Title,	URL, Hash, Action
    return [[
        getCurrentDateAndTimeFormattedForGoogleSheets(),
        email,
        IP,
        isMobile,
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
    dayjs.extend(utc);
    dayjs.extend(timezone);
    dayjs.tz.setDefault("America/New_York");
    return dayjs().tz("America/New_York").format("M/D/YY H:m:s");
};


const respondWith = (body, statusCode = 200) => {
    console.log(statusCode + ' RESPONSE', body);
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "GET, POST, OPTION",
        },
        body: JSON.stringify(typeof (body) === 'string' ? { message: body } : body)
    };
}