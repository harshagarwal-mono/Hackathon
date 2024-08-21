/* eslint-disable import/no-extraneous-dependencies */
const { rm } = require('shelljs');
const webpack = require('webpack');
/* eslint-enable import/no-extraneous-dependencies */
const path = require('path');
const fs = require('fs');
const webpackConfig = require('./webpack.config.js');
const packageJson = require('./package.json');

const preparePackageJson = () => {
    const json = {
        name: packageJson.name,
        productName: packageJson.productName,
        description: packageJson.description,
        version: packageJson.version,
        main: 'dist/main.bundle.js',
        author: 'Monotype',
    };

    return json;
};

const build = () => {
    const bundlePath = path.join(__dirname, 'bundle');
    rm('-rf', bundlePath);

    return new Promise((resolve, reject) => {
        webpack(webpackConfig())
        .run(async (error, stats) => {
            console.log('POST webpack:: ', error);
            const info = stats.toJson();

            if (error) {
                console.error(error.stack || error);
                if (error.details) {
                    console.error(error.details);
                }
                reject(error);
                return;
            }

            if (stats.hasErrors()) {
                console.error(info.errors);
            }

            if (stats.hasWarnings()) {
                console.warn(info.warnings);
            }

            console.log(stats.toString({
                assets: false,
                hash: true,
                chunks: false,
                colors: true,
            }));

            fs.writeFileSync(path.resolve(__dirname, 'bundle', 'package.json'), JSON.stringify(preparePackageJson(), null, 2));

            resolve();
        });
    });
};

build();

module.exports = {
    build,
};
