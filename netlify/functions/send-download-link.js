const postmark = require("postmark");
const { google } = require("googleapis");
const mailchimp = require("@mailchimp/mailchimp_marketing");
const hubspot = require('@hubspot/api-client')
const validator = require("email-validator");


const md5 = require("blueimp-md5");
const dayjs = require('dayjs')
var utc = require('dayjs/plugin/utc')
var timezone = require('dayjs/plugin/timezone') // dependent on utc plugin


exports.handler = async function (event, context) {
    const { url, title, email, isMobile } = JSON.parse(event.body);
    const IP = event.headers['x-nf-client-connection-ip'];
    console.log('Request from ' + IP);

    try {

        if (!validator.validate(email)) {
            throw new Error('Invalid email address: ' + email);
        }
        
        let errors = [];
        
        await sendEmail({url, title, email});

        const [resultofRecordDownloadRequest, resultOfAddSubscriberToMailChimp, resultOfAddSubscriberToHubspot] = await Promise.all([
                recordDownloadRequest({ url, title, email, IP, isMobile }).then(result => ({ result })).catch(error => ({ error })),
                addSubscriberToMailChimp(email).then(result => ({ result })).catch(error => ({ error })),
                addSubscriberToHubspot({email, title}).then(result => ({ result })).catch(error => ({ error }))
            ]);
        if (resultofRecordDownloadRequest.error) {
            errors.push({message: 'Error logging download request to Google Sheet', error: resultofRecordDownloadRequest.error});
        }
        if (resultOfAddSubscriberToMailChimp.error) {
            errors.push({ message: 'Error sending to MC', error: resultOfAddSubscriberToMailChimp.error});
        }

        if (resultOfAddSubscriberToHubspot.error) {
            errors.push({ message: 'Error sending to HS', error: resultOfAddSubscriberToHubspot.error});
        }
        
        if (errors.length) {
            await logError('Email sent but other errors occured', errors)
            return respondWith({message: 'Email sent but other errors occured', errors}); 
        } else {
            return respondWith('Success'); 
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

    // console.log('email', emailPayload);

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

    // console.log('dataInRows', dataInRows);

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

    const response = await mailchimp.lists.setListMember(
        listId, 
        md5(email.toLowerCase()),
        {
            email_address: email,
            status_if_new: "subscribed",
            tags: [tagName]
        }
    );

    // console.log(response.json());

    return response;

}

async function addSubscriberToHubspot({email, title}) {

    console.log("Adding email to Hubspot", email);

    try {
    
    const hubspotClient = new hubspot.Client({ accessToken: process.env.HUBSPOT_KEY });

    const getContactRequest = await hubspotClient.apiRequest({
            method: 'GET',
            path: `/crm/v3/objects/contacts/${email}`,
            qs: {
                idProperty: 'email',
                properties: 'website_file_download'
            }
        });

    if (getContactRequest.statusText === 'OK') {
        console.log('Updating existing Hubspot record with new download');
        const existingContact = await getContactRequest.json();
        const website_file_download = existingContact.properties.website_file_download ? existingContact.properties.website_file_download + '; ' + title : title;
        const updateContactRequest = await hubspotClient.apiRequest({
            method: 'PATCH',
            path: `/crm/v3/objects/contacts/${existingContact.id}`,
            body: { 
                properties: { 
                    website_file_download
                }
            }
        });
    } else {
        console.log('Creating new Hubspot record');
        const createContactRequest = await hubspotClient.apiRequest({
            method: 'POST',
            path: `/crm/v3/objects/contacts/`,
            body: {
                properties: {
                    email,
                    website_file_download: title,
                    lifecyclestage: 'marketingqualifiedlead', // aka 'Prospect'
                    hs_lead_status: 'NEW',
                    source: 'All Rise Toolkit Download',

                }
            }
        });
    }

    } catch (e) {
        console.error(e);
        throw (e);
    }
    
    return true;

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
        statusCode,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "GET, POST, OPTION",
        },
        body: JSON.stringify(typeof (body) === 'string' ? { message: body } : body)
    };
}