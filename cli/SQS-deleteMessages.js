#!/usr/bin/env node

var sqs = require('../model/service/sqs');
var queue = process.argv[2] || 'resizeImage';

sqs.deleteAllMessages(queue);