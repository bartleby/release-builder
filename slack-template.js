const rootTemplate = "{\"channel\": \"{channel}\",\"blocks\": [{root}]}"
const headerTemplate = "{\"type\": \"header\",\"text\": {\"type\": \"plain_text\",\"text\": \"{header}\",\"emoji\": true}},"
const dividerTemplate = "{\"type\": \"divider\"},"
const actionsTemplate = "{\"type\": \"actions\",\"elements\": [{actions}]},"
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
        .replaceAll("{channel}", channel)
        .replaceAll("{root}",
            headerTemplate
                .replaceAll("{header}", header)
            + imageSectionPattern
                .replaceAll("{header}", projectInfo)
                .replaceAll("{image}", imageUrl)
            + dividerTemplate
            + headerTemplate
                .replaceAll("{header}", "Changelog:")
            + dividerTemplate
            + changelog
            + dividerTemplate
            + actionsTemplate
                .replaceAll(
                    "{actions}",
                    actionTemplate
                        .replaceAll("{title}", "Open ZenHub")
                        .replaceAll("{url}", "https://app.zenhub.com/")
                    + actionStyleTemplate
                        .replaceAll("{title}", "New Issue")
                        .replaceAll("{url}", repoURL + "/issues/new?assignees=&labels=feature&template=feature.md&title=")
                        .replaceAll("{style}", "primary")
                    + actionStyleTemplate
                        .replaceAll("{title}", "New Bug Report")
                        .replaceAll("{url}", repoURL + "/issues/new?assignees=&labels=bug&template=bug.md&title=")
                        .replaceAll("{style}", "danger")
                )

        )
}

exports.slackTemplate = slackTemplate