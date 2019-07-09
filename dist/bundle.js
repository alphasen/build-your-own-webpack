(function(modules) {
    function require(moduleId) {
        const [fn, mapping] = modules[moduleId];
        function myRequire(filename) {
            return require(mapping[filename]);
        }
        const module = { exports: {} };
        fn(myRequire, module, module.exports);
        return module.exports;
    }
    require(0);
})({
    0: [
        function(require, module, exports) {
            'use strict';

            var _module_require = _interopRequireDefault(
                require('./module_require1')
            );

            function _interopRequireDefault(obj) {
                return obj && obj.__esModule ? obj : { default: obj };
            }

            // const lilei=require('./module_require')
            // console.log('lilei :', lilei);
            // lilei.eat('fish')
            console.log('lilei2 :', _module_require['default']);
        },
        { './module_require1': 1 }
    ],

    1: [
        function(require, module, exports) {
            'use strict';

            Object.defineProperty(exports, '__esModule', {
                value: true
            });
            exports['default'] = void 0;
            var _default = 'wangwu';
            exports['default'] = _default;
        },
        {}
    ]
});
