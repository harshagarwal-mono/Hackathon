/* eslint-disable import/no-extraneous-dependencies */
const { mv, rm } = require('shelljs');
/* eslint-enable import/no-extraneous-dependencies */
const builder = require('electron-builder');
const path = require('path');
const getElectronBuilderConfig = require('./electron-builder');

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
};

const make = async () => {
    const tempOutputPath = path.join(__dirname, 'out');
    rm('-rf', tempOutputPath);

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
};
