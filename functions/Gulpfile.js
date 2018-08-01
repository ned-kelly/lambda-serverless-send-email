var gulp = require('gulp'),
    gutil = require('gulp-util'),
    webpack = require('webpack'),
    webpackConfig = require("./webpack.config.js"),
    path = require('path'),
    fs = require('fs'),
    spawn = require('child_process').spawn;

const config = {
    publicDir: './.webpack'
};

gulp.task('serverless-offline', ['compile'], (cb) => {
    var startProcess = () => {
        var offline = spawn('serverless', [
            'offline',
            'start',
            '--port=80',
            '--host=0.0.0.0',
            '--stage=' + process.env.SERVERLESS_STAGE
        ]);

        offline.stdout.on('data', function (data) {
            console.log(data.toString());
        });

        offline.stderr.on('data', function (data) {
            console.log('stderr: ' + data.toString());
        });

        offline.on('exit', function (code) {
            console.log('child process exited with code ' + code.toString());
            console.log('Restarting serverless-offline');

            //Restart service
            startProcess();
        });
    };

    //Start process once
    startProcess();
});

gulp.task('compile', () => {
    webpack(webpackConfig(true), (err) => {
        if (err) {
            console.error('Webpack error', err);
        }
    });
});

gulp.task('compile-deploy', (cb) => {
    webpack(webpackConfig(false), (err) => {
        if (err) {
            console.error('Webpack error', err);
        }
        cb(err);
    });
});

gulp.task('default', ['serverless-offline']);
