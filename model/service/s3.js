var Q = require('q');
var AWS = require('aws-sdk');
var fs = require('fs');
var _ = require('underscore');

try{
	AWS.config.loadFromPath('../config.json');
} catch (e){}

var s3 = new AWS.S3();

var parseFilePath = function(remoteFilePath){
	var deferred = Q.defer();

	var match = remoteFilePath.match(/(s3:\/\/)(.*?)\/(.+)/);


	var result = (_(match).isNull()) ? {} : {
		bucket : match[2]
		,remoteFilePath : remoteFilePath
		,key : match[3]
	};

	deferred.resolve(result);

	return deferred.promise;
};
module.exports.parseFilePath = parseFilePath;

var putFile = function(localFilePath, remoteFilePath, bucket){
	var deferred = Q.defer();
	s3.putObject({
		Bucket : bucket
		,Key : remoteFilePath
		,Body : fs.readFileSync(localFilePath)
	}, function(err, data){
		if (err) {
			throw err;
		}

		data.remoteFilePath = 's3://' + bucket + '/' + remoteFilePath;

		return deferred.resolve(data);
	});

	return deferred.promise;
};
module.exports.putFile = putFile;

var putObject = function(params, cb){

	s3.putObject(params, function(err, data){
		if (err) {
			throw err;
		}

		return cb(data);
	});

};
module.exports.putObject = putObject;


var getFile = function(remoteFilePath, bucket){

	var deferred = Q.defer();
	s3.getObject({
		Bucket : bucket
		,Key : remoteFilePath
	}, function(err, data){
		if (err) {
			throw err;
		}

		return deferred.resolve(data);
	});

	return deferred.promise;
};
module.exports.getFile = getFile;


var deleteObject = function (deleteParams) {
	s3.deleteObject(deleteParams, function (err, data) {
		if (err) {
			console.log("delete err " + deleteParams.Key);
		} else {
			console.log("deleted " + deleteParams.Key);
		}
	});
};
module.exports.deleteObject = deleteObject;

var listBuckets = function () {
	s3.listBuckets({}, function (err, data) {
		var buckets = data.Buckets;
		var owners = data.Owner;
		for (var i = 0; i < buckets.length; i += 1) {
			var bucket = buckets[i];
			console.log(bucket.Name + " created on " + bucket.CreationDate);
		}
		for (var i = 0; i < owners.length; i += 1) {
			console.log(owners[i].ID + " " + owners[i].DisplayName);
		}
	});

};
module.exports.listBuckets = listBuckets;

var deleteBucket = function (bucket) {
	s3.deleteBucket({Bucket: bucket}, function (err, data) {
		if (err) {
			console.log("error deleting bucket " + err);
		} else {
			console.log("delete the bucket " + data);
		}
	});
};
module.exports.deleteBucket = deleteBucket;

var clearBucket = function (bucket) {
	var self = this;
	s3.listObjects({Bucket: bucket}, function (err, data) {
		if (err) {
			console.log("error listing bucket objects "+err);
			return;
		}
		var items = data.Contents;
		for (var i = 0; i < items.length; i += 1) {
			var deleteParams = {Bucket: bucket, Key: items[i].Key};
			self.deleteObject(deleteParams);
		}
	});
};
module.exports.clearBucket = clearBucket;
