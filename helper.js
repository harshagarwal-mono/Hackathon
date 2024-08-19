const fetch = require('electron-fetch').default;
const fs = require('fs');
const unzipper = require('unzipper');

const baseUrl = 'http://alocalhost:3000';

const getAssetsMetaData = async (token) => {
    const url = `${baseUrl}/fonts/${token}/metadata`;
    const response = await fetch(url);
    const data = await response.json();

    return map(({ 
        md5, fullName, psName, family,
    }) => ({
        FontMd5: md5,
        FontName: fullName,
        FontId: md5,
        FontPsName: psName,
        FontFamilyName: family,
    }), data);
}

const getUserData = async (token) => {
    const url = `${baseUrl}/fonts/${token}/user`;
    const response = await fetch(url);
    const data = await response.json();

    return data;
};

const downloadFiles = async (token, downloadPath) => {
    const url = `${baseUrl}/fonts/${token}/download`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const fileStream = fs.createWriteStream(downloadPath);
    return new Promise((resolve, reject) => {
        response.body.pipe(fileStream);
        response.body.on('error', (err) => {
            reject(new Error(`Failed to download file: ${err.message}`));
        });
        fileStream.on('finish', () => {
            resolve();
        });
    });
};

const unzipFile = async (zipFilePath, outputDir) => {
    return fs.createReadStream(zipFilePath)
        .pipe(unzipper.Extract({ path: outputDir }))
        .promise();
};

module.exports = {
    getAssetsMetaData,
    getUserData,
    downloadFiles,
    unzipFile,
}
