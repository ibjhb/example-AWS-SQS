#!/usr/bin/env node

// Load the SDK
var AWS = require('aws-sdk');

// Load the AWS credentials
AWS.config.loadFromPath('../config.json');

// Create an sqs client
var sqs = new AWS.SQS();

// Delete the first queue
var params = {
	QueueUrl : 'https://sqs.us-east-1.amazonaws.com/435206425092/resizeImage'
};

sqs.deleteQueue(params, function(err, data){
	if (err) {
		console.log(err, err.stack);
	} else {
		console.log(data);
	}
});
