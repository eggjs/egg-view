const os = require('os');

module.exports = {
  extends: 'eslint-config-egg',
  rules: {
    'linebreak-style': os.platform() === 'win32' ? 'off' : ['error', 'unix'],
  },
};
