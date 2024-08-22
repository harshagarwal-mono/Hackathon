const { either, isNil, isEmpty } = require("ramda");
const os = require('os');

const isEmptyOrNil = either(isNil, isEmpty);

const getMacAddress = () => {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
      if (iface.mac && iface.mac !== '00:00:00:00:00:00') {
        return iface.mac;
      }
    }
  }
  return null;
};

const getDeviceDetails = () => {
    const macAddress = getMacAddress();
    const platform = process.platform === 'darwin' ? 'mac' : 'windows';
    const osVersion = process.getSystemVersion();

    return {
        macAddress,
        os: platform,
        osVersion,
    };
};

module.exports = {
    isEmptyOrNil,
    getMacAddress,
    getDeviceDetails,
};
