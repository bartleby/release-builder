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
    return model.map( item => {
        return getHeader(item.title) + item.list.map( subtitle => {
            return getSection("*" +subtitle.title + "*" + "\\n" + subtitle.list.join("\\n"))
        }).join("")
    }).split(0, slack_blocks_limit - reserved_block_count).join("")
}

exports.generateSlackRelease = generateSlackRelease;