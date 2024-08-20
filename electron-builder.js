const getConfig = () => {
    const os = process.platform === 'darwin' ? 'mac' : 'win';

    return {
        appId: 'com.monotype.font-friend',
        productName: 'Font Friend',
        mac: {
            identity: 'Monotype Imaging (9TY7K37N87)',
            mergeASARs: false,
            category: 'public.app-category.graphics-design',
            extendInfo: {
                NSRequiresAquaSystemAppearance: false,
            },
        },
        asar: true,
        buildDependenciesFromSource: true,
        directories: {
            buildResources: 'static/electron-build-assets',
            output: 'out',
            app: 'bundle',
        },
        files: [
            'dist/main.bundle.js',
            'dist/preload.bundle.js',
        ],
        extraResources: [
            {
                from: `static/helperServices/${os}`,
                to: 'helperServices',
            },
        ],
        nodeGypRebuild: false,
    };
};

module.exports = getConfig;
