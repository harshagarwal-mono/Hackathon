const remote = require('@electron/remote');

const preloadDefinition = () => {
  const preload = () => {
      const {
          relay,
          deviceDetails,
      } = remote.getGlobal('MAS_APP');

      global.MAS_APP = {
         relay,
         deviceDetails,
      };
  };

  process.once('loaded', preload);
};

preloadDefinition();

module.exports = preloadDefinition;
