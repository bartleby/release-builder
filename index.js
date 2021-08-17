const core = require('@actions/core');
const util = require('util');
const execFile = util.promisify(require('child_process').execFile);
const {generateReleaseNotes} = require('./build-release');

let process = {env: {}};
process.env.GITHUB_REF = "undefined";

