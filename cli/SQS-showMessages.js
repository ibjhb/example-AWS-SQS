#!/usr/bin/env node

// Load the SDK
var AWS = require('aws-sdk');

// Load the AWS credentials
AWS.config.loadFromPath('../config.json');

// Create an sqs client
var sqs = new AWS.SQS();

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
			console.log('---- Full message : ', msg);
			var params = JSON.parse(msg.Body);

			console.log('--- Message : ', params);
		}
	}
	process.exit(0);
});
