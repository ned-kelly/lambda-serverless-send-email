<!--@'## Lambda + APIGateway (serverless) email sending API: "`' + pkg.name + '`"'-->
## Lambda + APIGateway (serverless) email sending API: "`email-api`"
<!--/@-->

A lightweight API to send an email from your website via Lambda + API Gateway using the Serverless framework.

Using this simple API, you may host your website out of an S3 bucket and still retain an email contact form on your website.

* * *

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com/)
[![License](https://img.shields.io/badge/License-MIT%20License-blue.svg?maxAge=2592000)](<>)

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup](#setup)
  - [Prepare for SLS Deploy](#prepare-for-sls-deploy)
  - [Prepare IAM credentials](#prepare-iam-credentials)
  - [Let serverless setup IAM credentials & CloudFormation scripts...](#let-serverless-setup-iam-credentials--cloudformation-scripts)
  - [Deploy all the things!](#deploy-all-the-things)
- [Configuration](#configuration)
  - [Prepare Email Mapping File.](#prepare-email-mapping-file)
  - [Configure Environment Variables:](#configure-environment-variables)
- [Running Locally](#running)
- [Endpoints](#endpoints)
  - [/send-email (post)](#send-email-post)
- [Example (embedding on your website)](#example-embedding-on-your-website)
- [Dependencies](#dependencies)
- [Dev Dependencies](#dev-dependencies)

## <a name="prerequisites">Prerequisites</a>

- AWS SDK (suggest installing globally as AWS bundle the SDK within Lambda, either way it's included as a dev-dependency);
- Serverless (If you've never used it's worth reading <http://docs.serverless.com/v0.5.0/docs> first!);
  - Note: If you're running a newer version of serverless then 0.5 you don't need to globally install Serverless - You may simply run: `npm run sls` to access the serverless 0.5 framework (which is bundled as a dev dependency within this project);
- It's also worth running `npm run sls dash summary` once you're setup to see what available functions are contained within this project.

## <a name="setup">Setup</a>

### Prepare for SLS Deploy

Run a simple `npm install`, which will pull down all the required packages.

### Prepare IAM credentials

If you've never configured the [AWS SDK](https://aws.amazon.com/cli/) on your machine run `aws configure --profile (name-of-aws-profile-to-add)` and go and add your IAM credentials (Note suggest adding full administrative credentials as Serverless requres access to create IAM Roles for Lambda).

Next - add the name of the AWS profile you just created (or your existing aws profile) into the `admin.env` file.

Example: `echo -e "AWS_PRD_PROFILE=(name-of-aws-profile-you-just-created)" > admin.env`

### Let serverless setup IAM credentials & CloudFormation scripts...

You will need to run `npm run sls project init -c` to setup the project. Note you will need to add a `-r REGION (i.e. ap-southeast-2)` if you wish to depoy your lambda function to somewhere other then Virginia.

Serverless will then go and setup the IAM user to run your lambda function... Note if you wish to change them from the default configuration you will need to update the CloudFormation template `s-resources-cf.json` file.

### Deploy all the things!

Finally we can run the commands to actually deploy the Lambda & API Gateway code!

To deploy:
`npm run sls dash deploy`

_Note_ You will need to deploy the Endpoint before deploying the function ... The easiest way to do this is to just select both the function and the endpoint when deploying, and if the deploy fails - run the `npm run sls dash deploy` command a 2nd timen (which should then work).

## Configuration

### Prepare Email Mapping File.

You will also need to create a file called: `email-mapping.json` and place it in the root an S3 bucket of your choice. The purpose of this file is to map names to email addresses (as we don't want to allow users just post to random email addresses on the internet otherwise this API could be used for spamming purpsoes)...

    An example `email-mapping.json` file is:

    {
        "Sales": "sales@mydomain.com",
        "Support": "support@mydomain.com",
        "Administration": "admin@mydomain.com" 
    }

### Configure Environment Variables:

Log into your AWS Console, and open the Lambda function that we just deployed... You will need to configure/set the following Environment Variables:

- S3BUCKET - _This is the name of the S3 bucket that the `email-mapping.json` file is read from..._
- FROM_EMAIL - \_This is the email address that you will receive email from - it should be a verified email in AWS SES or from one of your verified domains._

## <a name="running">Running Locally</a>

To run the project locally with the serverless-serve plugin (via nodemon) for development simply run the following:

    npm start

Note that you may want to export your AWS environment varibales before running `npm start` like so:

    export AWS_REGION="us-east-1"
    export AWS_ACCESS_KEY_ID="xxxxx"
    export AWS_SECRET_ACCESS_KEY="xxxxxxxxxx"

    npm start

## <a name="endpoints">Endpoints</a>

Please see the following examples of healthy/unhealthy responses returned from the Microservice.

### /send-email (post)

- **NB:** Service only accepts HTTP POST request and returns a JSON response... 

- Healthy / OK Response:

  - HTTP Response Code: 200
  - HTTP Response Type: 'application/json'
  - Example POST: `/send-email`


    { 
        To: "some-email@example.com",
        From: "blah@example.com",
        OtherField: "SomeValue"
    }

## Example (embedding on your website)

_**Pro-tip**_:
There are no speciffic required fields other then `From, Subject, and To` fields... All other items that are passed through in the JSON object posted to API Gateway will be delivered in your email.

    <form id="submitForm">
        Department:
        <select name="department">
            <option value="Sales">Sales</option>
            <option value="Support">Support</option>
            <option value="Administration">Administration</option>
        </select>

        <br />

        First Name: <input type="text" name="first-name" value="" /><br />
        Last Name: <input type="text" name="last-name" value="" /><br />
        Email: <input type="text" name="email" value="" /><br />
        Phone: <input type="text" name="phone" value="" /><br />

        Comments: <textarea name="comments"></textarea>
        
        <input type="submit" value="SEND" />
    </form>

    <script src="https://code.jquery.com/jquery-2.2.4.min.js" integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44=" crossorigin="anonymous"></script>
    <script type="text/javascript">
        // Bind to your HTML form's submit button...
        jQuery("#submitForm").submit(function(e) {
            e.preventDefault();

            // Get value of each element...
            var formData = {}
            var apiGatewayEndpoint = ""; // Example: qazxsw123123.execute-api.us-east-1.amazonaws.com

            formData.To = jQuery("select[name=department]").val();
            formData.FirstName = jQuery("input[name=first-name]").val();
            formData.LastName = jQuery("input[name=last-name]").val();
            formData.Email = jQuery("input[name=email]").val();
            formData.Phone = jQuery("input[name=phone]").val();
            formData.Comments = jQuery("textarea[name=comments]").val();

            formData.SUBJECT = "Contact form from your website to: [" + formData.To + "] department.";

            jQuery.ajax({
                type: 'POST',
                url: 'https://' + apiGatewayEndpoint + '/prd/send-email',
                crossDomain: true,
                data: JSON.stringify(formData),
                dataType: 'json',
                headers: {
                    'Content-Type': 'application/json'
                },
                success: function(responseData, textStatus, jqXHR) {
                    console.log('response from api: ' + responseData);
                    if (responseData.success == true) {
                        console.log("Form successfully submitted!");
                    } else {
                        console.log("ERROR! - Form successfully submitted, but Lambda Function returned an error (see Cloudwatch Logs for details)");
                    }
                },
                error: function(responseData, textStatus, errorThrown) {
                    console.log('ERROR! - ' + errorThrown + ', response from api: ' + responseData);
                }
            });

        })
    </script>

<!--@dependencies()-->
## <a name="dependencies">Dependencies</a>

None
<!--/@-->

<!--@devDependencies()-->
## <a name="dev-dependencies">Dev Dependencies</a>

- [aws-sdk](https://github.com/aws/aws-sdk-js): AWS SDK for JavaScript
- [mos](https://github.com/mosjs/mos): A pluggable module that injects content into your markdown files via hidden JavaScript snippets
- [nodemon](https://github.com/remy/nodemon): Simple monitor script for use during development of a node.js app.
- [serverless](https://github.com/serverless/serverless): The Serverless Application Framework - Powered By Amazon Web Services - <http://www.serverless.com>
- [serverless-cors-plugin](https://github.com/joostfarla/serverless-cors-plugin): Serverless CORS Plugin - Managing Cross-origin resource sharing (CORS) policies
- [serverless-optimizer-plugin](https://github.com/serverless/serverless-optimizer-plugin): Serverless Optimizer Plugin - Significantly reduces Lambda file size and improves performance
- [serverless-serve](https://github.com/Nopik/serverless-serve): Local lambda HTTP serve plugin for Serverless framework, a.k.a. API Gateway simulator.

<!--/@-->
