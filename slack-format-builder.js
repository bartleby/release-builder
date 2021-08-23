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