#!/usr/bin/env node

var fs = require('fs');

// Load the SDK
var AWS = require('aws-sdk');

// Load the AWS credentials
AWS.config.loadFromPath('../config.json');

// Create an sqs client
var s3 = new AWS.S3();

var bodyStream = fs.createReadStream( '../test.jpg' );

var params = {
	'Bucket' : 'awsSQSDemoImages'
	,'Key' : 'test.jpg'
	,'Body' : bodyStream
	,'ContentType' : 'image/jpeg'
	,'ACL' : 'public-read'
};


s3.putObject(params, function(err, data){
	if (err) {
		console.log(err, err.stack);
	} else {
		console.log(data);
	}
});
