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