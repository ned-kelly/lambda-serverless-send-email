## Lambda + APIGateway (Serverless) email sending API

A lightweight API to send an email from your website via Lambda + API Gateway using the Serverless framework.

Using this simple API, you may host your website out of an S3 bucket and still retain an email contact form on your website.

This project uses Docker to simplify getting up and running / testing locally.

* * *

[![GitHub issues](https://img.shields.io/github/issues/david-nedved/lambda-serverless-send-email.svg)]()
[![GitHub](https://img.shields.io/github/license/david-nedved/lambda-serverless-send-email.svg)]()
[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com/)
[![docker](https://img.shields.io/badge/Docker%20Compose-2.0-blue.svg?longCache=true&style=flat&logo=docker)]()

## Prerequisites

- AWS CLI Tools: `pip install awscli` [See guide/readme](https://aws.amazon.com/cli/)
- Docker - [Download installer here](https://www.docker.com/)
- Docker Compose - See [Install Instructions](https://docs.docker.com/compose/install/) here.

## Setup & Configuraiton

### Prepare and configure AWS profile

If you have not yet configured your AWS profile run: `aws --configure` to setup the default profile and your API Keys (You will need to create AWS API Keys via the ["IAM"](https://aws.amazon.com/iam/) tool if you have not yet done so. 

### Develop and test locally

Run the `./start-local.sh` script to start the docker container which contains the Serverless functions, AWS SDK etc for local deployment.

If you're on windows you may just run: `docker-compose up --build` rather than the _"start-local"_ shell script.

#### Setting email configuration:

You will need to edit the `functions/email/config.json` file to reflect the correct "from", "to" and "subject" lines - When we call the API, emails are only accepted to the object's key (by default it's `general-query` to prevent people from using this API to spam the world...

### Test locally

By default, you can test by performing a HTTP Post request to: `http://127.0.0.1:3003/api/send-email`. See below for an example of what the JSON Payload should look like under the "Implementing" section.

## Deploying to AWS

To deploy run: `./deploy.sh` - Note that you will need to change/configure the `AWS_PROFILE` from "default" to your preferred profile if you're using a non-default profile (This applies to the `serverless.yml`, `deploy.sh`, & `docker-compose.yml` files)

**NOTE** Take note of the API URL that is returned after deploying... (it will look something like _https://xxxxxxxxxxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prd/send-email_) ... You will need to set this API endpoint later in your front-end code.

## Implementing

### Posting to the API

There are no specific required fields to be posted to the API, other than `recipient` which needs to match the object key as specified in your `functions/email/config.json` file (so by default it's `general-query`). All other items that are passed through will be delivered in your email as a line item.

An API Post request should consist of the `recipient` matching whatever user & subject you want to send to in your `config.json`, followed by the body of the email specified as a JSON Object with the key: `data`:

```json
{
    "recipient": "general-query",
    "data": {
        "some key": "this is the first value",
        "some other field": "some value"
    }
}
```

**An example posting to the API (Locally) via CURL can be performed like so:**

```bash
curl -X POST \
  http://127.0.0.1:3003/api/send-email \
  -H 'Content-Type: application/json' \
  -d '{
    "recipient": "general-query",
    "data": {
        "body": "test email",
        "some field": "some other text..."
    }
}'
```

### Example HTML Form

Once you're happy with the API, you can implement to your website using your favourite Javascript Framework. Here's an example using jQuery:

```html
<form id="submitForm">
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
        var formData = {
            "recipient": "general-query",
            data: {}
        }
        var apiGatewayEndpoint = ""; // Example: https://xxxxxxxxxxxxx.execute-api.us-east-1.amazonaws.com/

        formData.data.FirstName = jQuery("input[name=first-name]").val();
        formData.data.LastName = jQuery("input[name=last-name]").val();
        formData.data.Email = jQuery("input[name=email]").val();
        formData.data.Phone = jQuery("input[name=phone]").val();
        formData.data.Comments = jQuery("textarea[name=comments]").val();

        jQuery.ajax({
            type: 'POST',
            url: 'https://' + apiGatewayEndpoint + '/prod/api/send-email',
            crossDomain: true,
            data: JSON.stringify(formData),
            dataType: 'json',
            headers: {
                'Content-Type': 'application/json'
            },
            success: function(responseData, textStatus, jqXHR) {
                console.log('response from api: ' + responseData);
            },
            error: function(responseData, textStatus, errorThrown) {
                console.log('ERROR! - ' + errorThrown + ', response from api: ' + responseData);
            }
        });

    })
</script>
```
