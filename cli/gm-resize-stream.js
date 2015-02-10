#!/usr/bin/env node

var request = require('request');
var gm = require('gm');

// Load the SDK
var AWS = require('aws-sdk');

// Load the AWS credentials
AWS.config.loadFromPath('../config.json');

// Create an S3 client
var s3 = new AWS.S3();

// Image is 1900x1522
gm(request('https://farm9.staticflickr.com/8482/8219998460_639a2c2ba9_o.jpg', 'my-images.jpg'))
	.resize('400','320')
	.stream(function(err, stdout) {
		var buf = new Buffer(0);
		stdout.on('data', function(d) {
			buf = Buffer.concat([buf, d]);
		});

		stdout.on('end', function() {
			var params = {
				'Bucket'		: 'awsSQSDemoImages'
				,'Key'			: 'Forrest_1.jpg'
				,'Body'			: buf
				,'ContentType'	: 'image/jpeg'
				,'ACL' 			: 'public-read'
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