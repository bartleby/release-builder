const util = require('util');
const execFile = util.promisify(require('child_process').execFile);
const repoURL = 'repo url'//process.env.GITHUB_SERVER_URL + '/' + process.env.GITHUB_REPOSITORY;
const commitsTags = ["feat:", "fix:", "perf:"]
const commitsTagTitles = [
    {"feat:": "Новый функционал"},
    {"fix:": "Исправлены ошибки"},
    {"perf:": "Улучшина производительность"}
]

async function generateReleaseNotes({range, dateFormat = 'short'}) {
    dateFormat = dateFormat.includes('%') ? 'format:' + dateFormat : dateFormat;
    // Get commits between computed range
    let {stdout: commits} = await execFile('git', [
        'log',
        '--format=%H¬%ad¬%s¬%b',
        '--date=' + dateFormat,
        range
    ].filter(Boolean));
    commits = commits.split('\n').filter(Boolean).map(line => {
        const [hash, date, title, body] = line.split('¬');
        return {
            hash: hash.slice(0, 8),
            date,
            title,
            body
        };
    });

    const commitEntries = [];

    for (const {hash, date, title, body} of commits) {
        let bodyCommits = body.split("\n").filter(Boolean)
        let regExp = RegExp("/" +bodyCommits.map(item => {"^" + item + "\s|"}).join("") + "^feat:\s" + "/i")
        let list = bodyCommits.filter(({title}) => !regExp.test(title))

        commitEntries.push({
            title: title,
            list: list
        });

        console.log("hash: " + hash + ", date: " + date + ", title: " + title + ", body: " + body);
    }



    console.log(commitEntries.map(item => {return "title: " + item.title + ", body: [" + item.list.join(", ") + "]"}))
    //

    return commitEntries.map(item => {return item.title}).filter(Boolean).join('\n');
    //return releaseTemplate
    //  .replace('{commits}', commitEntries.join('\n'))
    //.replace('{range}', `[\`${range}\`](${repoURL}/compare/${range})`);
}

exports.generateReleaseNotes = generateReleaseNotes;
