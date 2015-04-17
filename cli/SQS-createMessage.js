#!/usr/bin/env node

// Load the SDK
var AWS = require('aws-sdk');

// Load the AWS credentials
AWS.config.loadFromPath('../config.json');

// Create an sqs client
var sqs = new AWS.SQS();

var message = {
	uri			: 'https://farm9.staticflickr.com/8482/8219998460_639a2c2ba9_o.jpg'
	,width		: 400
	,height		: 320
};

var queue = 'https://sqs.us-east-1.amazonaws.com/435206425092/resizeImage'

var params = {
	MessageBody		: JSON.stringify(message)
	,'QueueUrl'		: queue
};

sqs.sendMessage(params, function(err, data){
	if (err) {
		console.log(err, err.stack);
	} else {
		console.log(data);
	}
});