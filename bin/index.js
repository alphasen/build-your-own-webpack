#!/usr/bin/env node
const Hpack = require('./hpack');

// 读取命令行中传入的配置文件位置
const options = process.argv;
let configFilePath;
if (options[2] && options[2].indexOf('--config') === 0) {
    configFilePath = options[3];
}

let hpack = new Hpack(configFilePath);
hpack.bundle();
