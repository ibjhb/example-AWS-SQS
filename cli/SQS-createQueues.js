#!/usr/bin/env node

// Load the SDK
var AWS = require('aws-sdk');

// Load the AWS credentials
AWS.config.loadFromPath('../config.json');

// Create an sqs client
var sqs = new AWS.SQS();

// Create the first queue
var params = {
	QueueName : 'resizeImage'
	,Attributes : {
		'VisibilityTimeout' : '120'
	}
};

sqs.createQueue(params, function(err, data){
	if (err) {
		console.log(err, err.stack);
	} else {
		console.log(data);
	}
});

// Create the second queue
var params = {
	QueueName : 'resizeImageComplete'
	,Attributes : {
		'VisibilityTimeout' : '120'
	}
};

sqs.createQueue(params, function(err, data){
	if (err) {
		console.log(err, err.stack);
	} else {
		console.log(data);
	}
});