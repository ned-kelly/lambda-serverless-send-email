import { Context, Callback } from 'aws-lambda';
import * as aws from 'aws-sdk'
const config = require('./config.json');

const resolveIpAddress = function (event) {
    const X_FORWARDED_FOR = 'X-Forwarded-For';
    if (!event || !event.headers) {
        return;
    }

    var result = event.headers[X_FORWARDED_FOR];
    if (!result) {
        return;
    }

    var index = result.indexOf(',');
    if (index === -1) {
        return result;
    }

    return result.substring(0, index);
}

const formatObject = function(data) : string {
    return Object.keys(data).filter(key => {
        return !!data[key];
    }).map((key) => {
        return `${key}: ${data[key]}`;
    }).join('\r\n');
}

const sendEmail = function(body: any, event: any) : Promise<any> {
    var ses = new aws.SES({apiVersion: '2010-12-01'});

    if (typeof config.from !== 'string') {
        return Promise.reject(new Error('Missing from email in config.json'));
    }
    
    if (typeof body.recipient !== 'string') {
        return Promise.reject(new Error('Missing recipient from request'));
    }

    var recipient = config.recipients[body.recipient];
    if (!recipient) {
        return Promise.reject(new Error(`Missing recipient from config matching ${body.recipient}`));
    }

    if (typeof recipient.to !== 'string') {
        return Promise.reject(new Error(`Missing to email from recipient ${body.recipient}`));
    }

    if (typeof recipient.subject !== 'string') {
        return Promise.reject(new Error(`Missing subject from recipient ${body.recipient}`));
    }

    var data = body.data;
    if (!data) {
        data = {};
    }

    data['IP Address'] = resolveIpAddress(event);

    var emailRequest = <aws.SES.Types.SendEmailRequest>{
        Source: config.from,
        Destination: { 
            ToAddresses: [ recipient.to ]
        },
        Message: {
            Body: {
                Text: {
                    Charset: 'UTF-8',
                    Data: formatObject(data)
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: recipient.subject
            }
        }
    }
    
    return new Promise((resolve, reject) => {
        ses.sendEmail(emailRequest, (err, data) => {
            if (err) {
                return reject(err);
            }
            return resolve(data);
        });
    });
}

const parseRequestBody = function (event) {
    try {
        return JSON.parse(event.body);
    } catch (err) {
        console.error('Error parsing request', err);
        return undefined;
    }
}

export const handler = function (event: any, context: Context, callback: Callback) {
    var body = parseRequestBody(event);
    
    if (!body) {
        return callback(null, {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
                "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
              },
            body: JSON.stringify({ message: 'Error parsing request' }),
        });
    }

    sendEmail(body, event).then(() => {
        callback(null, {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
                "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
              },
            body: JSON.stringify({ message: 'Success' })
        });
    }, err => {
        console.error('Error sending email', err.message);
        callback(null, {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
                "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
              },
            body: JSON.stringify({ message: 'Server error' })
        });
    });
}