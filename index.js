const core = require('@actions/core');
const util = require('util');
const execFile = util.promisify(require('child_process').execFile);
const {generateReleaseNotes} = require('./build-release');
const {generateHtmlRelease} = require("./html-format-builder");
const {generateSlackRelease} = require("./slack-format-builder");
const {slackTemplate} = require("./slack-template");

let process = {env: {}};
process.env.GITHUB_REF = "undefined";

        // parser release
        const changelog = await generateReleaseModel({range});
        const htmlRelease = await generateHtmlRelease(changelog);
        const slackRelease = await generateSlackRelease(changelog)

        const slackChangelog = slackTemplate(
            channel,
            header,
            projectName,
            buildUrl,
            releaseString,
            pushedTag,
            qrCodeUrl,
            slackRelease
        )

        core.setOutput('changelog-html', htmlRelease);
        core.setOutput('changelog-slack', slackChangelog);
        core.setOutput('tag-name', pushedTag);

        console.log('changelog-release: ' + htmlRelease)
        console.log('changelog-slack: ' + slackChangelog)

        core.info('Created changelog:\n`' + htmlRelease);
