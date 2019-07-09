/**
 * https://github.com/chinanf-boy/minipack-explain/blob/master/explain.md#use-link
 */
const path = require('path');
const fs = require('fs');
const babylon = require('babylon');
const traverse = require('@babel/traverse').default; // traverse是es6的包
const { transformFromAst } = require('@babel/core');
const _ = require('lodash');

class Hpack {
    constructor(config = '../hpack.config.js') {
        this.config = require(config);
        this.graph = []; // 依赖关系存储
        this.moduleId = 0; // moduleId从0开始
    }

    /**
     * 解析每个module,分析其依赖，返回分析结果
     * @param {string} filename 要解析的js file
     * @returns {
     *      id:moduleId,
     *      filename:moudle的位置
     *      dependencies:依赖关系
     *      code:文件内容
     *  }
     */
    compileModule(filename) {
        if (filename && !filename.endsWith('.js')) {
            filename += '.js';
        }
        const content = fs.readFileSync(filename, 'utf-8');
        const ast = babylon.parse(content, { sourceType: 'module' });
        // console.log('ast :', JSON.stringify(ast));
        const dependencies = [];
        // 遍历import ... 节点 处理文件依赖
        traverse(ast, {
            ImportDeclaration: ({ node }) => {
                dependencies.push(node.source.value);
            }
        });
        const { code } = transformFromAst(ast, null, {
            // es6代码转为es5
            presets: [
                [
                    '@babel/preset-env'
                    // { // 针对目标平台进行优化
                    //     targets: {
                    //         chrome: '75'
                    //     },
                    //     debug:true
                    // }
                ]
            ]
        });
        return {
            id: this.moduleId++,
            filename,
            dependencies,
            code
        };
    }

    /**
     * 从入口文件递归分析文件依赖关系
     * @param {string} entry 入口文件
     * 1. 获取入口文件的编译结果（id,依赖，code）
     * 2. 处理依赖的依赖关系
     *      1. 处理依赖的依赖关系（每个被依赖的module也是一个文件，跟入口文件一样的存在）
     *      2. 获取依赖的编译结果
     * ------------递归处理-----------------
     * 3. 将编译结果缓存queque
     *      [{
     *          id:'',
     *          filename:'',
     *          dependencies:['./foo.js'],
     *          code:function(){},
     *          mapping:''
     *      }]
     */
    drawGraph(entry) {
        this.graph.push(this.compileModule(entry));
        for (const module of this.graph) {
            let dirname = path.dirname(module.filename);
            module.mapping = {};
            module.dependencies.forEach(deptFile => {
                // 生成mapping 对照
                const absolutePath = path.join(dirname, deptFile); // 绝对路径
                const child = this.compileModule(absolutePath);
                module.mapping[deptFile] = child.id;
                this.graph.push(child);
            });
        }
    }

    /**
     * 生成最终的bundle文件
     */
    bundle() {
        this.drawGraph(this.config.entry);
        // console.log('this.graph :', JSON.stringify(this.graph));
        let modules = '';
        this.graph.forEach(module => {
            modules += `
            ${module.id}:[
                    function (require,module,exports) {
                        ${module.code}
                    },
                    ${JSON.stringify(module.mapping)}
                ],
            `;
        });
        let res = `
            (function (modules) {
                function require(moduleId) {
                    const [fn,mapping]=modules[moduleId]
                    function myRequire(filename) {
                        return require(mapping[filename])
                    }
                    const module={exports:{}}
                    fn(myRequire,module,module.exports)
                    return module.exports
                }
                require(0)
            })({${modules}})
        `;
        // 将结果输出
        fs.writeFileSync(this.getBundleFileName(), res, {
            flag: 'w+'
        });
        // console.log('res :', res);
        console.log('success');
    }

    getBundleFileName() {
        const {
            output: { path: outputPath, filename: bundleName }
        } = this.config;
        return path.resolve(outputPath, bundleName);
    }
}

module.exports = Hpack;
