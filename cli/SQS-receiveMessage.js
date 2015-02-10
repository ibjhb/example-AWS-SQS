#!/usr/bin/env node

var request = require('request');
var gm = require('gm');
var uuid = require('node-uuid');

// Load the SDK
var AWS = require('aws-sdk');

// Load the AWS credentials
AWS.config.loadFromPath('../config.json');

// Create an sqs client
var sqs = new AWS.SQS();
var s3 = new AWS.S3();

var params = {
	'QueueUrl' : 'https://sqs.us-east-1.amazonaws.com/435206425092/resizeImage'
	,'MaxNumberOfMessages' : 10
	,'WaitTimeSeconds' : 10
};

sqs.receiveMessage(params, function(err, data){
	if (err) {
		console.log(err, err.stack);
	} else {

		for (var x in data.Messages){
			var msg = data.Messages[x];
			var params = JSON.parse(msg.Body);

			console.log('--- URL : ', params.uri);

			gm(request(params.uri, 'my-images.jpg'))
				.resize(params.width)
				.stream(function(err, stdout, stderr) {

					var buf = new Buffer(0);
					stdout.on('data', function(d) {
						buf = Buffer.concat([buf, d]);
					});

					stdout.on('end', function() {
						var params = {
							'Bucket'		: 'awsSQSDemoImages'
							,'Key'			: uuid.v4() + '.jpg'
							,'Body'			: buf
							,'ContentType'	: 'image/jpeg'
							,'ACL'			: 'public-read'
						};
						s3.putObject(params, function(err, data){
							if (err) {
								console.log(err, err.stack);
							} else {
								console.log(data);
							}
						});
					});
				});

		}

	}
});
