module.exports=function styleLoader(content) {
    let wrapContent = `
        let style = document.createElement('style')
        style.innerHTML = ${JSON.stringify(content)}
        document.head.appendChild(style)
    `
    return wrapContent
}
