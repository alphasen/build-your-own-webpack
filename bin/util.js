function getModuleRequireDependencies(moduleStr) {
    const requireReg = /require\(.?(.*?).?\)/gm;
    let match = requireReg.exec(moduleStr);
    let dependencies = [];
    while (match != null) {
        let dependence = match[1]; // require('./foo') 中的 ./foo 部分
        dependencies.push(dependence);
        match = requireReg.exec(moduleStr);
    }
    return dependencies;
}

module.exports = {
    getModuleRequireDependencies
};
