module.exports = function (api) {
    if (api) {
        api.cache.never();
    }

    const plugins = [
        '@babel/plugin-proposal-class-properties',
        'module:fast-async',
        '@babel/plugin-transform-modules-commonjs'
    ];

    const env = {
        test: {
            presets: [
                [
                    '@babel/preset-env',
                    {
                        targets: {
                            browsers: [
                                'Chrome >= 54',
                                'ie >= 11',
                                'last 2 Firefox versions',
                                'last 2 Safari versions',
                                'last 2 Edge versions',
                                'iOS >= 9.3.2',
                                'ChromeAndroid >= 54',
                                'last 2 Android versions',
                                'Samsung >= 2.1',
                                'UCAndroid >= 11'
                            ],
                            node: 'current'
                        },
                        modules: 'commonjs',
                        debug: false,
                        exclude: ['transform-regenerator', 'transform-async-to-generator']
                    }
                ]
            ]
        }
    };

    return {
        plugins,
        env
    };
};
