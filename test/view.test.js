'use strict';

const assert = require('assert');
const path = require('path');
const request = require('supertest');
const mock = require('egg-mock');
const fs = require('mz/fs');
const fixtures = path.join(__dirname, 'fixtures');


describe('test/view.test.js', () => {
  afterEach(mock.restore);

  describe('multiple view engine', () => {
    const baseDir = path.join(fixtures, 'apps/multiple-view-engine');
    let app;
    before(() => {
      app = mock.app({
        baseDir: 'apps/multiple-view-engine',
      });
      return app.ready();
    });
    after(() => app.close());

    describe('use', () => {
      it('should throw when name do not exist', () => {
        assert.throws(() => {
          app.view.use();
        }, /name is required/);
      });

      it('should throw when viewEngine do not exist', () => {
        assert.throws(() => {
          app.view.use('a');
        }, /viewEngine is required/);
      });

      it('should throw when name has been registered', () => {
        class View {
          render() {}
          renderString() {}
        }
        app.view.use('b', View);
        assert.throws(() => {
          app.view.use('b', View);
        }, /b has been registered/);
      });

      it('should throw when not implement render', () => {
        class View {}
        assert.throws(() => {
          app.view.use('c', View);
        }, /viewEngine should implement `render` method/);
      });

      it('should throw when not implement render', () => {
        class View {
          render() {}
        }
        assert.throws(() => {
          app.view.use('d', View);
        }, /viewEngine should implement `renderString` method/);
      });

      it('should register success', () => {
        class View {
          render() {}
          renderString() {}
        }
        app.view.use('e', View);
        assert(app.view.get('e') === View);
      });
    });

    describe('render', () => {
      it('should render ejs', function* () {
        const res = yield request(app.callback())
          .get('/render-ejs')
          .expect(200);

        assert(res.body.filename === path.join(baseDir, 'app/view/ext/a.ejs'));
        assert(res.body.locals.data === 1);
        assert(res.body.options.opt === 1);
        assert(res.body.type === 'ejs');
      });

      it('should render nunjucks', function* () {
        const res = yield request(app.callback())
          .get('/render-nunjucks')
          .expect(200);

        assert(res.body.filename === path.join(baseDir, 'app/view/ext/a.nj'));
        assert(res.body.locals.data === 1);
        assert(res.body.options.opt === 1);
        assert(res.body.type === 'nunjucks');
      });

      it('should render with options.viewEngine', function* () {
        const res = yield request(app.callback())
          .get('/render-with-options')
          .expect(200);

        assert(res.body.filename === path.join(baseDir, 'app/view/ext/a.nj'));
        assert(res.body.type === 'ejs');
      });
    });

    describe('renderString', () => {
      it('should renderString', function* () {
        const res = yield request(app.callback())
          .get('/render-string')
          .expect(200);
        assert(res.body.tpl === 'hello world');
        assert(res.body.locals.data === 1);
        assert(res.body.options.viewEngine === 'ejs');
        assert(res.body.type === 'ejs');
      });

      it('should throw when no viewEngine', function* () {
        yield request(app.callback())
          .get('/render-string-without-view-engine')
          .expect(500);
      });

      it('should renderString twice', function* () {
        yield request(app.callback())
          .get('/render-string-twice')
          .expect('a,b')
          .expect(200);
      });

    });

    describe('locals', () => {
      it('should render with locals', function* () {
        const res = yield request(app.callback())
          .get('/render-locals')
          .expect(200);
        const locals = res.body.locals;
        assert(locals.a === 1);
        assert(locals.b === 2);
        assert(locals.ctx);
        assert(locals.request);
        assert(locals.helper);
      });

      it('should renderString with locals', function* () {
        const res = yield request(app.callback())
          .get('/render-string-locals')
          .expect(200);
        const locals = res.body.locals;
        assert(locals.a === 1);
        assert(locals.b === 2);
        assert(locals.ctx);
        assert(locals.request);
        assert(locals.helper);
      });
    });

    describe('resolve', () => {
      it('should loader without extension', function* () {
        const res = yield request(app.callback())
          .get('/render-without-ext')
          .expect(200);
        assert(res.body.filename === path.join(baseDir, 'app/view/loader/a.ejs'));
      });

      it('should throw when render file that extension is not configured', function* () {
        yield request(app.callback())
          .get('/render-ext-without-config')
          .expect(500)
          .expect(/Can\'t find viewEngine for /);
      });

      it('should throw when render file without viewEngine', function* () {
        yield request(app.callback())
          .get('/render-without-view-engine')
          .expect(500)
          .expect(/Can\'t find ViewEngine "html"/);
      });

      it('should load file from multiple root', function* () {
        const res = yield request(app.callback())
          .get('/render-multiple-root')
          .expect(200);
        assert(res.body.filename === path.join(baseDir, 'app/view2/loader/from-view2.ejs'));
      });

      it('should load file from multiple root when without extension', function* () {
        const res = yield request(app.callback())
          .get('/render-multiple-root-without-extenstion')
          .expect(200);
        assert(res.body.filename === path.join(baseDir, 'app/view2/loader/from-view2.ejs'));
      });

      it('should render load "name" before "name + defaultExtension" in multiple root', function* () {
        const res = yield request(app.callback())
          .get('/load-same-file')
          .expect(200);
        assert(res.body.filename === path.join(baseDir, 'app/view2/loader/a.nj'));
      });

      it('should load file that do not exist', function* () {
        yield request(app.callback())
          .get('/load-file-noexist')
          .expect(/Can\'t find noexist.ejs from/)
          .expect(500);
      });
    });
  });

  describe('check root', () => {
    let app;
    before(() => {
      app = mock.app({
        baseDir: 'apps/check-root',
      });
      return app.ready();
    });
    after(() => app.close());

    it('should check root config first', () => {
      assert(app.view.config.root.length === 0);
    });
  });

  describe('async function', () => {
    const baseDir = path.join(fixtures, 'apps/multiple-view-engine');
    let app;
    before(() => {
      app = mock.app({
        baseDir: 'apps/multiple-view-engine',
      });
      return app.ready();
    });
    after(() => app.close());

    it('should render', function* () {
      const res = yield request(app.callback())
        .get('/render-async')
        .expect(200);

      assert(res.body.filename === path.join(baseDir, 'app/view/ext/a.async'));
      assert(res.body.type === 'async');
    });

    it('should renderString', function* () {
      const res = yield request(app.callback())
        .get('/render-string-async')
        .expect(200);

      assert(res.body.tpl === 'async function');
      assert(res.body.type === 'async');
    });
  });


  describe('defaultViewEngine', () => {
    let app;
    before(() => {
      app = mock.app({
        baseDir: 'apps/default-view-engine',
      });
      return app.ready();
    });
    after(() => app.close());

    it('should render without viewEngine', function* () {
      yield request(app.callback())
        .get('/render')
        .expect('ejs')
        .expect(200);
    });

    it('should renderString without viewEngine', function* () {
      yield request(app.callback())
        .get('/render-string')
        .expect('ejs')
        .expect(200);
    });
  });

  describe('cache enable', () => {
    let app;
    const viewPath = path.join(__dirname, 'fixtures/apps/cache/app/view1/home.nj');
    before(() => {
      app = mock.app({
        baseDir: 'apps/cache',
      });
      return app.ready();
    });
    after(() => app.close());
    after(() => fs.writeFile(viewPath, 'a\n'));

    it('should cache', function* () {
      let res = yield request(app.callback())
        .get('/');
      assert(res.text === viewPath);

      yield fs.unlink(viewPath);
      res = yield request(app.callback())
        .get('/');
      assert(res.text === viewPath);
    });
  });

  describe('cache disable', () => {
    let app;
    const viewPath1 = path.join(__dirname, 'fixtures/apps/cache/app/view1/home.nj');
    const viewPath2 = path.join(__dirname, 'fixtures/apps/cache/app/view2/home.nj');
    before(() => {
      mock.env('local');
      app = mock.app({
        baseDir: 'apps/cache',
      });
      return app.ready();
    });
    after(() => app.close());
    after(() => fs.writeFile(viewPath1, ''));

    it('should cache', function* () {
      let res = yield request(app.callback())
        .get('/');
      assert(res.text === viewPath1);

      yield fs.unlink(viewPath1);
      res = yield request(app.callback())
        .get('/');
      assert(res.text === viewPath2);
    });
  });

  describe('options.root', () => {
    let app;
    const baseDir = path.join(fixtures, 'apps/options-root');
    before(() => {
      app = mock.app({
        baseDir: 'apps/options-root',
      });
      return app.ready();
    });
    after(() => app.close());

    it('should return name and root', function* () {
      let res = yield request(app.callback())
        .get('/');

      assert.deepEqual(res.body, {
        fullpath: path.join(baseDir, 'app/view/sub/a.html'),
        root: path.join(baseDir, 'app/view'),
        name: 'sub/a.html',
      });

      res = yield request(app.callback())
        .get('/absolute');

      assert.deepEqual(res.body, {
        fullpath: path.join(baseDir, 'app/view/sub/a.html'),
        root: path.join(baseDir, 'app/view'),
        name: '/sub/a.html',
      });
    });
  });

  describe('out of view path', () => {
    let app;
    before(() => {
      app = mock.app({
        baseDir: 'apps/out-of-path',
      });
      return app.ready();
    });
    after(() => app.close());

    it('should 500 when filename out of path', function* () {
      yield request(app.callback())
        .get('/render')
        .expect(500)
        .expect(/Can't find \.\.\/a\.html/);
    });
  });
});
