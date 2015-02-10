#!/usr/bin/env node

var sqs = require('../model/service/sqs');
var _ = require('underscore');
var Q = require('q');
var resizeImage = require('../model/service/resizeImage');
var queue = 'resizeImage';

(function go(){
	sqs
		.receiveMessage(queue, 10)
		.then(function(messages){
			var promises = [];
			_(messages.Messages).each(function(msg){
				var msg = JSON.parse(msg.Body);
				promises.push(resizeImage.resizeURL(msg.uri, msg.width, msg.height));
			});
			return [messages.Messages, Q.allSettled(promises)];
		})
		.spread(function(messages, data){

			console.log(data);

			var promises = [];

			_(messages).each(function(msg){
				promises.push(sqs.deleteMessage(msg.ReceiptHandle, queue));
			});

			return Q.allSettled(promises);
		})
		.done(function(){
			console.log('Done. Restarting.');
			go();
		});
})()