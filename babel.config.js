module.exports = function(api) {
    api.cache(true);

    const presets = [
        ['@babel/preset-env', {
            'targets': [
                'last 2 version',
                'ie >= 9'
            ],
            modules: false // transform esm to cjs, false to keep esm.
        }]
    ];
    const plugins = [
        '@babel/plugin-transform-runtime',
        '@babel/plugin-external-helpers',
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-optional-chaining',
        '@babel/plugin-proposal-export-default-from',
        ['babel-plugin-module-resolver', {
            alias: {
                '^constants/(.+)': './src/constants/\\1',
                '^enums/(.+)': './src/enums/\\1',
                '^helpers/(.+)': './src/helpers/\\1'
            }
        }]
    ];

    return {
        presets,
        plugins,
        env: {
            test: {
                presets: ['@babel/preset-env']
            }
        }
    };
};