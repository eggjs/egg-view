'use strict';

module.exports = app => {
  class View {
    * render(name, locals, options) {
      return {
        fullpath: name,
        root: options.root,
        name: options.name,
      };
    }

    * renderString(name) {
      return name;
    }
  }
  app.view.use('html', View);
};
