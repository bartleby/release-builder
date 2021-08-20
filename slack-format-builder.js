const headerPattern = "{\"type\": \"header\",\"text\": {\"type\": \"plain_text\",\"text\": \"{header}\",\"emoji\": true}},"
const sectionPattern = "{\"type\": \"section\",\"text\": {\"type\": \"mrkdwn\",\"text\": \"{subject}\"}},"
function getHeader(title = "") {
    return headerPattern.replaceAll(RegExp("{header}", "ig"), title)
}

function getSection(subject = "") {
    return sectionPattern.replaceAll(RegExp("\{subject\}", "ig"), subject)
}

async function generateSlackRelease(model) {
    return model.map( item => {
        return getHeader(item.title) + item.list.map( subtitle => {
            return getSection("*" +subtitle.title + "*" + "\\n" + subtitle.list.join("\\n"))
        }).join("")
    }).join("")
}

exports.generateSlackRelease = generateSlackRelease;