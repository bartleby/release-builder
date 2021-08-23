/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 938:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

const util = __nccwpck_require__(669);
const execFile = util.promisify(__nccwpck_require__(129).execFile);
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


/***/ }),

/***/ 37:
/***/ ((__unused_webpack_module, exports) => {

const headerPattern = "<h2>{header}</h2>"
const sectionItemPattern = "<li>{item}</li>"
const sectionPattern = "<h3>{header}</h3><ul>{subject}</ul>"

function getHeader(title = "") {
    return headerPattern.replace(RegExp("{header}", "ig"), title)
}

function getSection(title = "", subject = "") {
    return sectionPattern
        .replace(RegExp("\{header\}", "ig"), title)
        .replace(RegExp("\{subject\}", "ig"), subject)
}

async function generateHtmlRelease(model) {
    return model.map( item => {
        return getHeader(item.title) + item.list.map( subtitle => {
            return getSection(
                subtitle.title,
                subtitle.list
                    .map(i => {return sectionItemPattern.replace(RegExp("\{item\}", "ig"), i)})
                    .join("")
            )
        }).join("")
    }).join("")
}

exports.generateHtmlRelease = generateHtmlRelease;

/***/ }),

/***/ 604:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.issue = exports.issueCommand = void 0;
const os = __importStar(__nccwpck_require__(87));
const utils_1 = __nccwpck_require__(245);
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 127:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getState = exports.saveState = exports.group = exports.endGroup = exports.startGroup = exports.info = exports.warning = exports.error = exports.debug = exports.isDebug = exports.setFailed = exports.setCommandEcho = exports.setOutput = exports.getBooleanInput = exports.getMultilineInput = exports.getInput = exports.addPath = exports.setSecret = exports.exportVariable = exports.ExitCode = void 0;
const command_1 = __nccwpck_require__(604);
const file_command_1 = __nccwpck_require__(352);
const utils_1 = __nccwpck_require__(245);
const os = __importStar(__nccwpck_require__(87));
const path = __importStar(__nccwpck_require__(622));
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = utils_1.toCommandValue(val);
    process.env[name] = convertedVal;
    const filePath = process.env['GITHUB_ENV'] || '';
    if (filePath) {
        const delimiter = '_GitHubActionsFileCommandDelimeter_';
        const commandValue = `${name}<<${delimiter}${os.EOL}${convertedVal}${os.EOL}${delimiter}`;
        file_command_1.issueCommand('ENV', commandValue);
    }
    else {
        command_1.issueCommand('set-env', { name }, convertedVal);
    }
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    const filePath = process.env['GITHUB_PATH'] || '';
    if (filePath) {
        file_command_1.issueCommand('PATH', inputPath);
    }
    else {
        command_1.issueCommand('add-path', {}, inputPath);
    }
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.
 * Unless trimWhitespace is set to false in InputOptions, the value is also trimmed.
 * Returns an empty string if the value is not defined.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    if (options && options.trimWhitespace === false) {
        return val;
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Gets the values of an multiline input.  Each value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string[]
 *
 */
function getMultilineInput(name, options) {
    const inputs = getInput(name, options)
        .split('\n')
        .filter(x => x !== '');
    return inputs;
}
exports.getMultilineInput = getMultilineInput;
/**
 * Gets the input value of the boolean type in the YAML 1.2 "core schema" specification.
 * Support boolean input list: `true | True | TRUE | false | False | FALSE` .
 * The return value is also in boolean type.
 * ref: https://yaml.org/spec/1.2/spec.html#id2804923
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   boolean
 */
function getBooleanInput(name, options) {
    const trueValue = ['true', 'True', 'TRUE'];
    const falseValue = ['false', 'False', 'FALSE'];
    const val = getInput(name, options);
    if (trueValue.includes(val))
        return true;
    if (falseValue.includes(val))
        return false;
    throw new TypeError(`Input does not meet YAML 1.2 "Core Schema" specification: ${name}\n` +
        `Support boolean input list: \`true | True | TRUE | false | False | FALSE\``);
}
exports.getBooleanInput = getBooleanInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    process.stdout.write(os.EOL);
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 */
function error(message) {
    command_1.issue('error', message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 */
function warning(message) {
    command_1.issue('warning', message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 352:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

// For internal use, subject to change.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.issueCommand = void 0;
// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
const fs = __importStar(__nccwpck_require__(747));
const os = __importStar(__nccwpck_require__(87));
const utils_1 = __nccwpck_require__(245);
function issueCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
    }
    fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: 'utf8'
    });
}
exports.issueCommand = issueCommand;
//# sourceMappingURL=file-command.js.map

/***/ }),

/***/ 245:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.toCommandValue = void 0;
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 846:
/***/ ((__unused_webpack_module, exports) => {

const headerPattern = "{\"type\": \"header\",\"text\": {\"type\": \"plain_text\",\"text\": \"{header}\",\"emoji\": true}},"
const sectionPattern = "{\"type\": \"section\",\"text\": {\"type\": \"mrkdwn\",\"text\": \"{subject}\"}},"

const reserved_block_count = 10
const slack_blocks_limit = 50
function getHeader(title = "") {
    return headerPattern.replace(RegExp("{header}", "ig"), title)
}

function getSection(subject = "") {
    return sectionPattern.replace(RegExp("\{subject\}", "ig"), subject)
}

async function generateSlackRelease(model) {
    let blockCount = 0
    return model.map( item => {
        blockCount += item.list.length + 1 // + header
        console.log("blockCount: " + blockCount)
        if (blockCount >= slack_blocks_limit - reserved_block_count) { return "null" }
        return getHeader(item.title) + item.list.map( subtitle => {
            return getSection("*" +subtitle.title + "*" + "\\n" + subtitle.list.join("\\n"))
        }).join("")
    }).filter(i => {return i !== "null"}).join("")
}

exports.generateSlackRelease = generateSlackRelease;

/***/ }),

/***/ 259:
/***/ ((__unused_webpack_module, exports) => {

const rootTemplate = "{\"channel\": \"{channel}\",\"blocks\": [{root}]}"
const headerTemplate = "{\"type\": \"header\",\"text\": {\"type\": \"plain_text\",\"text\": \"{header}\",\"emoji\": true}},"
const dividerTemplate = "{\"type\": \"divider\"},"
const actionsTemplate = "{\"type\": \"actions\",\"elements\": [{actions}]}"
const imageSectionPattern = "{\"type\": \"section\",\"text\": {\"type\": \"mrkdwn\",\"text\": \"{header}\"},\"accessory\": " +
    "{\"type\": \"image\",\"image_url\": \"{image}\",\"alt_text\": \"qr code\"}},"
const actionTemplate = "{\"type\": \"button\",\"text\": {\"type\": \"plain_text\",\"text\": \"{title}\",\"emoji\": true},\"url\": \"{url}\"},"
const actionStyleTemplate = "{\"type\": \"button\",\"text\": {\"type\": \"plain_text\",\"text\": \"{title}\",\"emoji\": true},\"style\": \"{style}\",\"url\": \"{url}\"},"
const repoURL = process.env.GITHUB_SERVER_URL + '/' + process.env.GITHUB_REPOSITORY;
function slackTemplate(
    channel = "",
    header = "",
    projectName = "",
    buildUrl = "",
    releaseType = "",
    version = "",
    imageUrl = "",
    changelog = ""
    ) {
    let projectInfo =
        "Project: " + projectName + "\\n"
        + "Diawi: " + buildUrl + "\\n"
        + "Type: " + releaseType + "\\n"
        + "Version: " + version

    return rootTemplate
        .replace("{channel}", channel)
        .replace("{root}",
            headerTemplate
                .replace("{header}", header)
            + imageSectionPattern
                .replace("{header}", projectInfo)
                .replace("{image}", imageUrl)
            + dividerTemplate
            + headerTemplate
                .replace("{header}", "Changelog:")
            + dividerTemplate
            + changelog
            + dividerTemplate
            + actionsTemplate
                .replace(
                    "{actions}",
                    actionTemplate
                        .replace("{title}", "Open ZenHub")
                        .replace("{url}", "https://app.zenhub.com/")
                    + actionStyleTemplate
                        .replace("{title}", "New Issue")
                        .replace("{url}", repoURL + "/issues/new?assignees=&labels=feature&template=feature.md&title=")
                        .replace("{style}", "primary")
                    + actionStyleTemplate
                        .replace("{title}", "New Bug Report")
                        .replace("{url}", repoURL + "/issues/new?assignees=&labels=bug&template=bug.md&title=")
                        .replace("{style}", "danger")
                        .slice(0, -1)
                )

        )
}

exports.slackTemplate = slackTemplate

/***/ }),

/***/ 129:
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),

/***/ 747:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 87:
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ 622:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ 669:
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(127);
const util = __nccwpck_require__(669);
const execFile = util.promisify(__nccwpck_require__(129).execFile);
const {generateReleaseModel} = __nccwpck_require__(938);
const {generateHtmlRelease} = __nccwpck_require__(37);
const {generateSlackRelease} = __nccwpck_require__(846);
const {slackTemplate} = __nccwpck_require__(259);

let process = {env: {}};
process.env.GITHUB_REF = "undefined";

async function run() {
    try {
        const header = core.getInput("header");
        const buildUrl = core.getInput("build-url");
        const qrCodeUrl = core.getInput("qr-code-url");
        const projectName = process.env.GITHUB_REPOSITORY;
        const isRelease = core.getInput("is-release")
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

})();

module.exports = __webpack_exports__;
/******/ })()
;