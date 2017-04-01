'use strict';

module.exports = app => {
  app.get('/', function* () {
    yield this.render('sub/a.html');
  });
};
