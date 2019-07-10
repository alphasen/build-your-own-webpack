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

            var lilei = require('./module_require');

            console.log('lilei :', lilei);
            lilei.eat('fish');
            console.log('lilei2 :', _module_require['default']);
            inc.addEventListener('click', function() {
                lilei.incId();
                lilei.sayId();
            });
        },
        { './module_require1': 1, './module_require': 2 }
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
    ],

    2: [
        function(require, module, exports) {
            'use strict';

            var id = 1;
            module.exports = {
                name: 'lilei',
                age: 33,
                eat: function eat(food) {
                    console.log(food);
                },
                sayId: function sayId() {
                    console.log(id);
                },
                incId: function incId() {
                    id++;
                }
            };
        },
        {}
    ]
});
