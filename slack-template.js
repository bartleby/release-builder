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