function hyperlink(url,text){
    return `\u001b]8;;${url}\u001b\\${text}\u001b]8;;\u001b\\`
}

module.exports = { hyperlink }