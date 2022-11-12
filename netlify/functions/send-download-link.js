const postmark = require("postmark");
const { google } = require("googleapis");
const mailchimp = require("@mailchimp/mailchimp_marketing");

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

            try {
                await addSubscriberToMailChimp(email);
                return respondWith('Success'); 
            } catch(error) {
                await logError('Email sent and logged to Sheets, but error sending to MC', error);
                return respondWith({ message: 'Email sent and logged, but not added to MC', error });
            }

            
        } catch (error) {
            await logError('Error logging download request to Google Sheet', error);
            return respondWith({ message: 'Email sent, but not logged', error });
            
        }
    } catch (error) {
        await logError('Error sending email', error);
        return respondWith({ message: 'Email could not be sent', error }, 500);
    }

   
}

async function logError(msg, data) {
    console.error(msg, data);
    // Timestamp, Type, Description, Details
    try {
        return appendGoogleSheet('log', [[getCurrentDateAndTimeFormattedForGoogleSheets(), 'ERROR', msg, JSON.stringify(data)]])
    } catch (error) {
        console.error('ERROR when trying to log error to Google Sheets', error);
    }
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

    console.log('dataInRows', dataInRows);

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

async function addSubscriberToMailChimp(email) {
    
    const listId = '2570b44922';
    // Tags {1853: tlg-website-newsletter-signup, 1854: all-rise-sneak-peak, 1864: all-rise-toolkit-download }
    const tagName = 'all-rise-toolkit-download';
    
    mailchimp.setConfig({
        apiKey: process.env.MAILCHIMP_API_KEY,
        server: "us21",
    });

    const response = await mailchimp.lists.addListMember(listId, {
        email_address: email,
        status: "subscribed",
        tags: [tagName]
    });

    // console.log(response.json());

    return response;

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