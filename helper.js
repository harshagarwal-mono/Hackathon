const { map, } = require('ramda');
const fetch = require('electron-fetch').default;
const fs = require('fs');
const extract = require('extract-zip');
const path = require('path');
const { isEmptyOrNil } = require('./utils');

const baseUrl = 'http://localhost:3000';

const getAssetsMetaData = async (token) => {
    const url = `${baseUrl}/fonts/${token}/metadata`;
    const response = await fetch(url);
    const data = await response.json();

    return map(({ 
        md5, fullName, psName, family,
    }) => ({
        fontMd5: md5,
        fontName: fullName,
        fontId: md5,
        fontPsName: psName,
        fontFamilyName: family,
    }), data);
}

const getUserData = async (token) => {
    return {
        name: 'John Doe',
        email: 'johndoe@email.com',
        token,
    };
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

    const data = await response.json();
    const { status, url: downloadUrl } = data;

    if (status !== 'success') {
        throw new Error(`Failed to download file with status : ${status}`);
    }
   
    if (isEmptyOrNil(downloadUrl)) {
        throw new Error(`Failed to download file with empty url`);
    }

    const directory = path.dirname(downloadPath);

    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }

    const downloadResponse = await fetch(downloadUrl);

    const fileStream = fs.createWriteStream(downloadPath);
    return new Promise((resolve, reject) => {
        downloadResponse.body.pipe(fileStream);
        downloadResponse.body.on('error', (err) => {
            reject(new Error(`Failed to download file: ${err.message}`));
        });
        fileStream.on('finish', () => {
            resolve();
        });
    });
};

const unzipFile = async (zipFilePath, outputDir) => {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
   await extract(zipFilePath, { dir: outputDir });
};

const getDownloadPathForFont = (fontsDir, fontMd5) => {
    const fontDownloadDirPath = path.join(fontsDir, fontMd5);
    const files = fs.readdirSync(fontDownloadDirPath);
    const [file] = files;
    return path.join(fontDownloadDirPath, file);
};

module.exports = {
    getAssetsMetaData,
    getUserData,
    downloadFiles,
    unzipFile,
    getDownloadPathForFont,
}
