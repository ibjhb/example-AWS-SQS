#!/usr/bin/env node

// User :
// https://www.flickr.com/photos/34599854@N07
// API :
// https://api.flickr.com/services/rest/?&method=flickr.people.getPublicPhotos&api_key=01bfb245153d6210278037e3e1b65658&user_id=34599854@N07&format=json&extras=url_o&nojsoncallback=false

var url = 'https://api.flickr.com/services/rest/?&method=flickr.people.getPublicPhotos&api_key=01bfb245153d6210278037e3e1b65658&user_id=34599854@N07&format=json&extras=url_o&nojsoncallback=false';
var _ = require('underscore');

var https = require('https');

// Load the SDK
var AWS = require('aws-sdk');

// Load the AWS credentials
AWS.config.loadFromPath('../config.json');

// Create an sqs client
var sqs = new AWS.SQS();


https.get(url, function(res) {
	var body = '';

	res.on('data', function(chunk) {
		body += chunk;
	});

	res.on('end', function() {
		var photos = JSON.parse(body);
		photos = photos.photos.photo;
		for (var x in photos){
			var url_o = photos[x].url_o;
			for (var j = 0; j <= 1; j++){
				var params = {
					MessageBody : JSON.stringify({
						uri		: url_o
						,width	: _.random(200,400) + '^'   // Appending ^ means resulting width or height are treated
						,height	: _.random(200,400) + '^'	// as minimum values rather than maximum values.
					})
					,'QueueUrl' : 'https://sqs.us-east-1.amazonaws.com/435206425092/resizeImage'
				};

				sqs.sendMessage(params, function(err, data){
					if (err) {
						console.log(err, err.stack);
					} else {
						console.log(data);
					}
				});
			}
		}
	});
}).on('error', function(e) {
	console.log("Got error: ", e);
});