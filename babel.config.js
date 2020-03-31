module.exports = {
    presets: [
        '@babel/preset-react',
        [
            '@babel/preset-typescript',
            {
                isTSX: true,
                allExtensions: true,
            },
        ],
        [
            '@babel/preset-env',
            {
                // modules: false,
                targets: {
                    node: 'current',
                },
            },
        ],
    ],
    plugins: [
        [
            '@babel/plugin-proposal-decorators',
            {
                legacy: true,
            },
        ],
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-nullish-coalescing-operator',
        '@babel/plugin-proposal-optional-chaining',
        [
            'babel-plugin-transform-imports',
            {
                lodash: {
                    transform: 'lodash/${member}',
                    preventFullImport: true,
                },
                'react-virtualized': {
                    transform: 'react-virtualized/dist/es/${member}',
                    preventFullImport: true,
                },
            },
        ],
        'react-hot-loader/babel',
    ],
    sourceMaps: true,
};
