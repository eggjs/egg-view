'use strict';

const sleep = require('mz-modules/sleep');

class AsyncView {
  render(filename, locals, options) {
    const ret = {
      filename,
      locals,
      options,
      type: 'async',
    };
    return sleep(10).then(() => ret);
  }

  renderString(tpl, locals, options) {
    const ret = {
      tpl,
      locals,
      options,
      type: 'async',
    };
    return sleep(10).then(() => ret);
  }

}

module.exports = AsyncView;
