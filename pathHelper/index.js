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
    return '/Applications/FontFriend/.Components/MonotypeFontsFontIO';
    // return '/Applications/Monotype Fonts/.Components/Services/CoreServices/MonotypeFontsFontIO';
};

module.exports = {
    getFontIOPath,
    getResourcesDir,
    getExePath,
};
