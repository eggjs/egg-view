'use strict';

const sleep = require('mz-modules/sleep');

class NunjucksView {
  * render(filename, locals, options) {
    yield sleep(10);
    return {
      filename,
      locals,
      options,
      type: 'nunjucks',
    };
  }

  * renderString(tpl, locals, options) {
    yield sleep(10);
    return {
      tpl,
      locals,
      options,
      type: 'nunjucks',
    };
  }
}

module.exports = NunjucksView;
