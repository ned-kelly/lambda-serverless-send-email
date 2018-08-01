#Closest version to 4.3 (What Lambda runs)
FROM node:4.8-alpine

ENV NPM_CONFIG_LOGLEVEL error

RUN npm install -g serverless@1.23.0 \
    gulp-cli@1.2.2

WORKDIR /var/functions