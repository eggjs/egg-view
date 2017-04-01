'use strict';

module.exports = app => {
  app.get('/', function* () {
    yield this.render('sub/a.html');
  });

  app.get('/absolute', function* () {
    yield this.render('/sub/a.html');
  });
};
