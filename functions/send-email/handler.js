'use strict';

// load aws sdk
var aws = require('aws-sdk');

// load aws config
aws.config.region = process.env.SERVERLESS_REGION || 'us-east-1'; // Virginia

var S3BUCKET = process.env.S3BUCKET || 'website-configuration';
var FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@domain.com';


// load AWS SES
var ses = new aws.SES({apiVersion: '2010-12-01'});
var s3 = new aws.S3();

module.exports.handler = function(event, context, cb) {

    // Before we begin - let's read a json mapping file from S3 that lists all the email addresses that we will allow to deliver email fro...
    // The prupose of this is to prevent people from using our API to spam random people on the internet (we wouldn't want to just allow anyone to specify who they can send email to)...

    var params = {Bucket: S3BUCKET, Key: 'email-mapping.json'};

    s3.getObject(params, function(err, data) {
        if (err) {

            console.log(err, err.stack);
            return cb(null, { success: false, error: "Could not find email-mapping.json in S3 Bucket: [" + S3BUCKET + "]"});

        } else {

            var emailMapping = JSON.parse(data.Body);

            // Object to store all the contents of the email body that we will later post to the AWS SES API (to send the email to customer)
            var emailBody = {};

            // Loop through each item in the post object and store in our object...
            if(event.body) {
                Object.keys(event.body).forEach(function(key) {
                    emailBody[key] = event.body[key]
                });
            }

            // Include IP Information in email (may be of use if we have people spamming us in the future...)
            if(event.UserAgent) { emailBody.UserAgent = event.UserAgent }
            if(event.sourceIp) {
                // NB: Regex is to strip out the APIGateway IP from string...
                emailBody.sourceIp = event.sourceIp.replace(/,[^,]+$/, "");
            }
            
            // Store the email subject in variable (NB We're doing this three times in-case the subject parameter is in all upercase, lowercasem etc
            if(emailBody.SUBJECT) { var emailSubject = emailBody.SUBJECT }
            else if(emailBody.subject) { var emailSubject = emailBody.SUBJECT }
            else if(emailBody.Subject) { var emailSubject = emailBody.SUBJECT }
            else { var emailSubject = "New email from website contact form." }

            // Convert 'object' into a pretty plain-text string that will be sent in the email to the user...
            var emailTextData = "";
            //var keyNames = Object.keys(emailBody);

            for (var name in emailBody) {
                emailTextData += name + ": " + emailBody[name] + "\n";
            }
            
            // Now it's time to send the email...
            // send to list (This will be mapped from a JSON file that we will store in a S3 bucket
            // so we don't need to update the code every time we want to add a new "to" address)

            if(emailBody.TO) { var emailTo = emailBody.TO }
            else if(emailBody.to) { var emailTo = emailBody.to }
            else if(emailBody.To) { var emailTo = emailBody.To }
            else { var emailTo = false };

            // If no emailTo is specified - exit; don't send the email!
            if(emailTo == false) {
                return cb(null, { success: false, error: "No 'TO' or 'to' field was specified in the JSON POST request!"});
                process.exit();
            } else {

                if(emailMapping[emailTo]) {
                    var to = [emailMapping[emailTo]];
                } else {
                    return cb(null, { success: false, error: "Could not find the specified 'to' name name in email-mapping.json file"});
                    process.exit();
                }
            }

            // this must relate to a verified SES account
            var from = FROM_EMAIL;

            var params = {
               Source: from, 
               Destination: { ToAddresses: to },
               Message: {
                   Subject: {
                      Data: emailSubject
                   },
                   Body: {
                       Text: {
                           Data: emailTextData,
                       }
                   }
               }
            };

            // this sends the email
            ses.sendEmail(params, function(err, data) {
                if(err) {
                    console.log(err);
                    // Return false to the API request if there was an error!
                    return cb(null, { success: false, error: err});
                } else {
                    // Return true to the API request if email was sent...
                    return cb(null, {success: true});
                }
             });


        }
    });

};
