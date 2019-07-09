/**
 * https://github.com/chinanf-boy/minipack-explain/blob/master/explain.md#use-link
 */
const path = require('path');
const fs = require('fs');
const babylon=require('babylon')
const traverse = require('babel-traverse').default;
const _=require('lodash')

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
        const content = fs.readFileSync(filename,'utf-8');
        const ast = babylon.parse(content,{sourceType:'module'});
        // console.log('ast :', JSON.stringify(ast));
        const dependencies=[]
        traverse(ast,{
            ImportDeclaration:(node)=>{
                dependencies.push(node.source.value)
            },
            VariableDeclaration:(node)=>{
                const caleeName=_.get(node,'init.callee.name')
                if(caleeName==='require'){
                    let dept=_.get(node,'init.callee.arguments[0].value')
                    console.log('dept :', dept);
                }
            }
        })
        return {
            id:this.moduleId++,filename,dependencies,
        }
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
        console.log('this.graph :', JSON.stringify(this.graph));
    }
}

module.exports = Hpack;
