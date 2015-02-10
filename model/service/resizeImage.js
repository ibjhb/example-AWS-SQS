var Q = require('q');
var request = require('request');
var gm = require('gm');
var uuid = require('node-uuid');
var s3 = require('./s3');


var resizeURL = function(url, width, height){
	var deferred = Q.defer();

	gm(request(url, 'my-images.jpg'))
		.resize(width, height)
		.stream(function(err, stdout, stderr) {

			var buf = new Buffer(0);
			stdout.on('data', function(d) {
				buf = Buffer.concat([buf, d]);
			});

			stdout.on('end', function() {

				var bucket = 'awsSQSDemoImages';

				gm(buf).size({bufferStream: true}, function(err, size){

					var params = {
						'Bucket' : bucket
						,'Key' : uuid.v4() + '-' + size.width + 'x' + size.height + '.jpg'
						,'Body' : buf
						,'ContentType' : 'image/jpeg'
						,'ACL' : 'public-read'
					};

					s3.putObject(params, function(data){

						var obj = {
							width : size.width
							,height : size.height
							,filename : 's3://' + params.Bucket + '/' + params.Key
							,url : url
						}

						return deferred.resolve(obj);
					});

				});

			});
		});

	return deferred.promise;
};

module.exports.resizeURL = resizeURL;