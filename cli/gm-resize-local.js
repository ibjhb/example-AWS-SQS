#!/usr/bin/env node

var gm = require('gm');

gm('/Volumes/SSD48/temp/Skyworld.jpg')
	.resize(100, 100)
	.write('/Volumes/SSD48/temp/test.jpg', function(err){
		if (err) {
			console.log('ERROR');
			console.log(err, err.stack);
		} else {
			console.log('done');
		}
	});