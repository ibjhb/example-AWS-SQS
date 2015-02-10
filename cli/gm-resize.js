#!/usr/bin/env node

var request = require('request');
var gm = require('gm');


gm(request('http://mycoolbackgrounds.com/backgrounds/10124/Skyworld.jpg', 'my-images.jpg'))
	.resize(100, 100)
	.write('../my-image.jpg', function(err){
		if (err) {
			console.log('ERROR');
			console.log(err, err.stack);
		} else {
			console.log('done');
		}
	});