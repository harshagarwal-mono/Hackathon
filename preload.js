const remote = require('@electron/remote');

const preloadDefinition = () => {
  const preload = () => {
      const {
          relay,
      } = remote.getGlobal('MAS_APP');

      global.MAS_APP = {
         relay,
      };
  };

  process.once('loaded', preload);
};

preloadDefinition();

module.exports = preloadDefinition;
