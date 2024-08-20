const path = require('path');
const { app } = require('electron');

const getExePath = () => {
    return path.dirname(app.getPath('exe'));
};

const getResourcesDir = () => {
    if (process.platform === 'darwin') {
        return path.join(getExePath(), '..', 'Resources');
    }
    return path.join(getExePath(), 'resources');
};

const getFontIOPath = () => {
    return '/Applications/Monotype Fonts/.Components/Services/CoreServices/MonotypeFontsFontIO';
    const resourcesDir = getResourcesDir();

    if (process.platform === 'darwin') {
        return path.join(resourcesDir, 'helperServices', 'MonotypeFontsFontIO');
    }

    return path.join(resourcesDir, 'helperServices', 'MonotypeFontsFontIO.exe');
};

module.exports = {
    getAppPath,
    getFontIOPath,
};
