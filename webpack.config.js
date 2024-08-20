const CopyWebpackPlugin = require('copy-webpack-plugin');

const rootPath = `${__dirname}`;
const srcPath = `${rootPath}`;
const outputPath = `${rootPath}/bundle`;

module.exports = () => ({
    devtool: 'source-map',
    mode: 'development',
    target: 'electron-main',
    entry: {
        main: `${srcPath}/main.js`,
        preload: `${srcPath}/preload.js`,
    },
    output: {
        path: `${outputPath}/dist`,
        filename: '[name].bundle.js',
        devtoolModuleFilenameTemplate: '[absolute-resource-path]'
    },
    node: {
        __dirname: false,
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: `${__dirname}/protos`,
                    to: `${outputPath}/dist/protos`,
                },
            ],
        }),
    ],
});
