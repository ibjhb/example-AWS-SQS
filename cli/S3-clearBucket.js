#!/usr/bin/env node

var s3 = require('../model/service/s3');

s3.clearBucket('awsSQSDemoImages');