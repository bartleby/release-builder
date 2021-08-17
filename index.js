const core = require('@actions/core');
const util = require('util');
const execFile = util.promisify(require('child_process').execFile);
const {generateReleaseNotes} = require('./build-release');
