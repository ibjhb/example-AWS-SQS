var Q = require('q');
var uuid = require('node-uuid');
var AWS = require('aws-sdk');
var sqsBase = 'https://sqs.us-east-1.amazonaws.com/435206425092/';
var _ = require('underscore');

AWS.config.loadFromPath('../config.json');

var sqs = new AWS.SQS();

var prepareFilesToSend = function(files){
	var deferred = Q.defer();
	var messages = _(files).map(function(file){
		return {
			Id : uuid.v4()
			,MessageBody : JSON.stringify({
				filename : file
				,created : new Date()
			})
		};
	});
	deferred.resolve(messages);

	return deferred.promise;
};

var sendMessage = function(message, queue){

	var deferred = Q.defer();
	sqs.sendMessage({
		QueueUrl : queue
		,MessageBody : message
	}, function(){
		deferred.resolve(arguments);
	});

	return deferred.promise;
};

module.exports.sendMessage = sendMessage;

var sendMessageBatch = function(messages, queue){
	queue = (queue.indexOf('https://sqs') !== -1) ? queue : sqsBase + queue;

	var deferred = Q.defer();
	sqs.sendMessageBatch({
		QueueUrl : queue
		,Entries : messages
	}, function(err, result){
		if (err) {
			throw err;
		}

		if (result.Failed.length){
			console.log('--------------- sendMessageBatch result failed', result.Failed);
		}

		deferred.resolve(result);
	});

	return deferred.promise;
};

var sendMessageGroup = function(messages, queue){
	var promises = [];
	var msgs = _(messages).map(function(msg){
		return {
			Id : uuid.v4()
			,MessageBody : JSON.stringify(msg)
		};
	});

	var m = [];
	var q = [];

	_(msgs).each(function(obj, i){
		q.push(obj);
		if (i % 10 === 0){
			m.push(q);
			q = [];
		}
	});

	_(m).each(function(msg){
		promises.push(sendMessageBatch(msg, queue));
	});


	return Q.all(promises);
};
module.exports.sendMessageGroup = sendMessageGroup;

var sendFilesToProcess = function(files, queue){
	queue = queue || settings.queues.fileToProcess;

	prepareFilesToSend(files.file)
		.then(function(messages){
			sendMessageBatch(messages, queue);
		});
};

module.exports.sendFilesToProcess = sendFilesToProcess;

var deleteAllMessages = function(queue){
	queue = (queue.indexOf('https://sqs') !== -1) ? queue : sqsBase + queue;

	receiveMessage(queue, 10)
		.then(function(data){
			data = _(data.Messages).chain().pluck('ReceiptHandle').map(function(msg){
				return {
					Id : uuid.v4()
					,ReceiptHandle : msg
				};
			}).value();

			return (_(data).isEmpty()) ? [] : deleteMessages(queue, data);
		})
		.then(function(results){
			return (_(results).isArray() && _(results).isEmpty()) ? true : deleteAllMessages(queue);
		})
		.then(function(done){
			if (done){
				console.log('All messages deleted.');
			}
		})
		.done();
};
module.exports.deleteAllMessages = deleteAllMessages;

var deleteMessages = function(queue, entries){
	var deferred = Q.defer();

	sqs.deleteMessageBatch({
		QueueUrl : queue
		,Entries : entries
	}, function(err, data){
		deferred.resolve(data);
	});

	return deferred.promise;
};

var deleteMessage = function(ReceiptHandle, queue){
	var deferred = Q.defer();
	queue = (queue.indexOf('https://sqs') !== -1) ? queue : sqsBase + queue;

	sqs.deleteMessage({
		QueueUrl : queue
		,ReceiptHandle : ReceiptHandle
	}, function(){
		deferred.resolve(arguments);
	});

	return deferred.promise;
};

module.exports.deleteMessage = deleteMessage;

var receiveMessage = function(queue, MaxNumberOfMessages){
	var deferred = Q.defer();
	queue = (queue.indexOf('https://sqs') !== -1) ? queue : sqsBase + queue;

	sqs.receiveMessage({
		QueueUrl : queue
		,MaxNumberOfMessages : MaxNumberOfMessages
		,WaitTimeSeconds : 10
	}, function(err, data){
		deferred.resolve(data);
	});

	return deferred.promise;
};

module.exports.receiveMessage = receiveMessage;