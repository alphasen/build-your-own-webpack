const path = require('path');
const fs = require('fs');

class Hpack {
    constructor(config = '../hpack.config.js') {
        this.config = require(config);
    }

    /**
     * 获取最终输出的文件名
     */
    generateBundleFileName() {
        const {
            output: { path: outputPath, filename: bundleName }
        } = this.config;
        return path.resolve(outputPath, bundleName);
    }

    /**
     * 通过require中的module名获取文件内容
     * @param {*} module require的文件名
     */
    getFileOfModule(module) {
        let moduleFilePath = path.resolve(
            path.dirname(this.config.entry),
            module.endsWith('.js') ? 'module' : `${module}.js`
        );
        return fs.readFileSync(moduleFilePath).toString();
    }

    /**
     * 从模块文件字符串中获取真正的exports
     * @param {string} str 模块字符串
     */
    getExportStr(str = '') {
        const regexp = /module.exports=([\s\S]*)/gm;
        const match = regexp.exec(str);
        return match[1];
    }

    pipe(entryFileStr) {
        const requireReg = /require\(.?(.*?).?\)/gm;
        let match = requireReg.exec(entryFileStr);
        while (match != null) {
            let module = match[1]; // require('./foo') 中的 ./foo 部分
            let moduleFileStr = this.getFileOfModule(module);
            entryFileStr = entryFileStr.replace(
                match[0],
                this.getExportStr(moduleFileStr)
            ); // 替换 require('./foo') 为foo (foo指 module.exports={foo})
            match = requireReg.exec(entryFileStr);
        }
        return entryFileStr
    }

    /**
     * 入口
     */
    pack() {
        const { entry } = this.config;

        // 读取文件内容
        let entryFileStr = fs.readFileSync(entry).toString();

        // TODO 一系列处理
        entryFileStr=this.pipe(entryFileStr);

        // 将结果输出
        fs.writeFileSync(this.generateBundleFileName(), entryFileStr, {
            flag: 'w+'
        });
    }
}

module.exports = Hpack;
