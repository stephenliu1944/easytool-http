import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import { eslint } from 'rollup-plugin-eslint';
import replace from 'rollup-plugin-replace';
import { uglify } from 'rollup-plugin-uglify';
import del from 'rollup-plugin-delete';
import alias from 'rollup-plugin-alias';
import pkg from './package.json';

const BUILD_PATH = process.env.BUILD_PATH || 'build';
const FILE_NAME = 'index';
var { main, module, browser, libraryName } = pkg;
var cjsName = main.split('/')[1];
var esmName = module.split('/')[1];
var umdName = browser.split('/')[1];

export default [{
    input: 'src/index.js',
    external: ['qs', 'axios'],    // 打包时排除外部依赖包
    output: [{
        name: libraryName,
        file: `${BUILD_PATH}/${umdName}`,
        format: 'umd',
        globals: {
            qs: 'qs',
            axios: 'axios'
        }
    }, {
        file: `${BUILD_PATH}/${cjsName}`,
        format: 'cjs'
    }, {
        file: `${BUILD_PATH}/${esmName}`,
        format: 'es'
    }],
    plugins: [
        del({ targets: `${BUILD_PATH}/*` }),
        alias({
            constants: 'src/_constants',
            utils: 'src/_utils'
        }),
        babel({
            exclude: 'node_modules/**'  // only transpile our source code
        }),
        resolve(), 	// so Rollup can find node_modules file
        commonjs(), // so Rollup can convert node_modules's cjs to an es module
        eslint({
            fix: true,
            throwOnError: true,
            include: ['src/**/*.js'],
            configFile: '.eslintrc.prod.json'
        }),
        // 全局变量
        replace({
            __DEV__: false,
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        }),
        // uglify()	                     // minify, but only in production
    ]
}];