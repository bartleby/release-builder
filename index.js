const core = require('@actions/core');
const util = require('util');
const execFile = util.promisify(require('child_process').execFile);
const {generateReleaseModel} = require('./build-release');
const {generateHtmlRelease} = require("./html-format-builder");
const {generateSlackRelease} = require("./slack-format-builder");
const {slackTemplate} = require("./slack-template");

let process = {env: {}};
process.env.GITHUB_REF = "undefined";

async function run() {
    try {
        const header = core.getInput("header");
        const buildUrl = core.getInput("build-url");
        const qrCodeUrl = core.getInput("qr-code-url");
        const projectName = process.env.GITHUB_REPOSITORY;
        const isRelease = core.getInput("is-release") ?? false;
        const channel = core.getInput("channel");
        const releaseString = (isRelease === "true" || isRelease === true) ? "Release" : "Pre Release"

        // Fetch tags from remote
        await execFile('git', ['fetch', 'origin', '+refs/tags/*:refs/tags/*']);

        // Get all tags, sorted by recently created tags
        const {stdout: t} = await execFile('git', ['tag', '-l', '--sort=-creatordate']);
        const tags = t.split('\n').filter(Boolean).map(tag => tag.trim());

        if (tags.length === 0) {
            core.info('There is nothing to be done here. Exiting!');
            console.log("There is nothing to be done here. Exiting!");
            return;
        }

        let pushedTag = core.getInput('tag') || tags[0];
        if (process.env.GITHUB_REF.startsWith('refs/tags/')) {
            pushedTag = process.env.GITHUB_REF.replace('refs/tags/', '');
            core.info('Using pushed tag as reference: ' + pushedTag);
            console.log('Using pushed tag as reference: ' + pushedTag);
        }

        // Get range to generate diff
        let range = tags[1] + '..' + pushedTag;
        if (tags.length < 2) {
            const {stdout: rootCommit} = await execFile('git', ['rev-list', '--max-parents=0', 'HEAD']);
            range = rootCommit.trim('') + '..' + pushedTag;
        }
        core.info('Computed range: ' + range);

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
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
