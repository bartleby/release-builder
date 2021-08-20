const util = require('util');
const execFile = util.promisify(require('child_process').execFile);
const commitKeys = {
    "feat": "Новый функционал:",
    "fix": "Исправлены ошибки:",
    "perf": "Улучшена производительность:",
    "refactor": "Рефакторинг кода:",
    "other": "Другие работы:"
}

let groupedCommits = []

async function generateReleaseModel({range, dateFormat = 'short'}) {
    dateFormat = dateFormat.includes('%') ? 'format:' + dateFormat : dateFormat;
    // Get commits between computed range
    let {stdout: commits} = await execFile('git', [
        'log',
        '--format=%s|%h|%ad|%b(^)',
        '--date=' + dateFormat,
        range
    ].filter(Boolean));
    commits = commits.split("(^)").filter(Boolean).map(line => {
        const commit = line.split('|')
        const [title, hash, date, body] = commit

        return {
            hash: hash,
            date: date,
            title: title,
            body: body
        };
    });

    for (const {hash, date, title, body} of commits) {
        if (body === undefined) {continue}

        let commitTitle = removeNewLineSymbols(title)
        let commitKey = keyFromCommit(commitTitle)
        const regExp = makeRegExp(commitKey)(false, "", true)
        const commitSubject = commitTitle.replace(regExp, "")

        let bodyCommits = body
            .split("\n")
            .filter(i => {return "" !== i})
            .filter(i => {return "\r" !== i})
        const otherKey = "other"
        if (bodyCommits.length === 0) {
            let groupIndex = getIndexFor(otherKey, groupedCommits)

            if (groupIndex === -1) {
                groupedCommits.push({key: otherKey, title: commitKeys[otherKey], list: []})
                groupIndex = groupedCommits.length - 1
            }

            if (commitKey === "none") {continue}

            let index = getIndexFor(commitKey, groupedCommits[groupIndex].list)
            if (index === -1) {
                groupedCommits[groupIndex].list.push({key: commitKey, title: commitKeys[commitKey], list: []})
                index = groupedCommits[groupIndex].list.length - 1
            }
            groupedCommits[groupIndex].list[index].list.push(commitSubject)

            continue
        }

        for (const rawBodyCommitTitle of bodyCommits) {
            const bodyCommitTitle = removeNewLineSymbols(rawBodyCommitTitle)
            const bodyCommitKey = keyFromCommit(bodyCommitTitle)

            if (bodyCommitKey === "none") {
                continue
            }

            const bodyCommitRegExp = makeRegExp(bodyCommitKey)(false, "\\* ", true)
            const bodyCommitSubject = bodyCommitTitle.replace(bodyCommitRegExp, "")
            let groupIndex = getIndexFor(commitTitle, groupedCommits)

            if (groupIndex === -1) {
                groupedCommits.push({key: commitTitle, title: commitTitle, list: []})
                groupIndex = groupedCommits.length - 1
            }

            let bodyCommitKeyIndex = getIndexFor(bodyCommitKey, groupedCommits[groupIndex].list)
            if (bodyCommitKeyIndex === -1) {
                groupedCommits[groupIndex].list.push({key: bodyCommitKey, title: commitKeys[bodyCommitKey], list: []})
                bodyCommitKeyIndex = groupedCommits[groupIndex].list.length - 1
            }
            groupedCommits[groupIndex].list[bodyCommitKeyIndex].list.push(bodyCommitSubject)
        }
    }
    return groupedCommits
}

function makeRegExp(key = "") {
    return function (mustBegin = true, prefix = "", isGlobal = false) {
        let start = mustBegin ? "\^" : ""
        let flags = isGlobal ? "ig" : "i"
        return RegExp(start + prefix + key + ": ", flags)
    }
}

function removeNewLineSymbols(value = "") {
    return value
        .replace("\n", "")
        .replace("\r", "")
        .trim()
}

function keyFromCommit(commit = "") {
    for (let key in commitKeys) {
        let reqExp = makeRegExp(key)
        if (reqExp().test(commit)) {
            return key
        }
        if (reqExp(true, "\\* ").test(commit)) {
            return key
        }
    }
    return "none"
}

function getIndexFor(key = "", inArray = []) {
    for (const i in inArray) {
        if (inArray[i].key === key) {
            return i
        }
    }
    return -1
}


exports.generateReleaseModel = generateReleaseModel;
