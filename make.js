/* eslint-disable import/no-extraneous-dependencies */
const { mv, rm } = require('shelljs');
const webpack = require('webpack');
/* eslint-enable import/no-extraneous-dependencies */
const builder = require('electron-builder');
const path = require('path');
const fs = require('fs');
const getElectronBuilderConfig = require('./electron-builder');
const webpackConfig = require('./webpack.config.js');
const packageJson = require('./package.json');

const archMap = {
    'arm': builder.Arch.arm64,
    'intel': builder.Arch.x64,
    'universal': builder.Arch.universal,
};

const outputFolderNameForElectronBuilder = {
    mac: {
        'arm': 'mac-arm64',
        'intel': 'mac',
        'universal': 'mac-universal',
    },
    win: {
        'intel': 'win-unpacked'
    },
};
const getElectronBuilderOutPathAndFinalOutputPath = (os, arch) => {
    const electronBuilderOutputDir = path.resolve(__dirname, 'out', outputFolderNameForElectronBuilder[os][arch]);

    return {
        electronBuilderOutputDir,
        outputPath: path.resolve(__dirname, 'out', `${os}-out`),
    };
}

const clean = () => {
    const tempOutputPath = path.join(__dirname, 'out');
    const distPath = path.join(__dirname, 'dist');
    rm('-rf', tempOutputPath);
    rm('-rf', distPath);
};

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
    clean();
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

const make = async () => {
    await build();
    const arch = 'intel';
    const os = process.platform === 'darwin' ? 'mac' : 'win';
    const platformToTargetHandler = {
        mac: () => builder.Platform.MAC.createTarget('dir', archMap[arch]),
        win: () => builder.Platform.WINDOWS.createTarget('dir', archMap[arch]),
    };
    const target = platformToTargetHandler[os]();
    const config = getElectronBuilderConfig();

    const stdOut = await builder.build({
        targets: target,
        config,
    })

    console.log(stdOut);

    const { electronBuilderOutputDir, outputPath } = getElectronBuilderOutPathAndFinalOutputPath(os, arch);
    console.log(`[MAKE] moving electron builder output to ${outputPath} from ${electronBuilderOutputDir}`);
    mv(electronBuilderOutputDir, outputPath);
};

make();

module.exports = {
    make,
    build,
    clean,
};
