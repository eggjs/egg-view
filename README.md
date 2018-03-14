# egg-view

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-view.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-view
[travis-image]: https://img.shields.io/travis/eggjs/egg-view.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-view
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-view.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-view?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-view.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-view
[snyk-image]: https://snyk.io/test/npm/egg-view/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-view
[download-image]: https://img.shields.io/npm/dm/egg-view.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-view

Base view plugin for egg

**it's a plugin that has been built-in for egg.**

## Install

```bash
$ npm i egg-view --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.view = {
  enable: true,
  package: 'egg-view',
};
```

## Use a template engine

[egg-view] don't have build-in view engine, So you should choose a template engine like [ejs], and install [egg-view-ejs] plugin.

You can choose a template engine first, link [ejs], so we use [egg-view-ejs] plugin.

`egg-view` is in [eggjs], so you just need configure [egg-view-ejs].

```js
// config/plugin.js
exports.ejs = {
  enable: true,
  package: 'egg-view-ejs',
};
```

Configure the mapping, the file with `.ejs` extension will be rendered by ejs.

```js
// config/config.default.js
exports.view = {
  mapping: {
    '.ejs': 'ejs',
  },
};
```

In controller, you can call `ctx.render`.

```js
module.exports = app => {
  return class UserController extends app.Controller {
    * list() {
      const { ctx } = this;
      yield ctx.render('user.ejs');
    }
  };
};
```

If you call `ctx.renderString`, you should specify viewEngine in viewOptions.

```js
module.exports = app => {
  return class UserController extends app.Controller {
    * list() {
      const { ctx } = this;
      ctx.body = yield ctx.renderString('<%= user %>', { user: 'popomore' }, {
        viewEngine: 'ejs',
      });
    }
  };
};
```

## Use multiple view engine

[egg-view] support multiple view engine, so you can use more than one template engine in one application.

If you want add another template engine like [nunjucks], then you can add [egg-view-nunjucks] plugin.

Configure the plugin and mapping

```js
// config/config.default.js
exports.view = {
  mapping: {
    '.ejs': 'ejs',
    '.nj': 'nunjucks',
  },
};
```

You can simply render the file with `.nj` extension.

```js
yield ctx.render('user.nj');
```

## How to write a view plugin

You can use [egg-view]' API to register a plugin.

### View engine

Create a view engine class first, and implement `render` and `renderString`, if the template engine don't support, just throw an error. The view engine is context level, so it receive ctx in `constructor`.

```js
// lib/view.js
module.exports = class MyView {
  constructor(ctx) {
    // do some initialize
    // get the plugin config from `ctx.app.config`
  }

  * render(fullpath, locals) {
    return myengine.render(fullpath, locals);
  }

  * renderString() { throw new Error('not implement'); }
};
```

`render` and `renderString` support generator function, async function, or normal function return a promise.

If the template engine only support callback, you can wrap it by Promise.

```js
class MyView {
  render(fullpath, locals) {
    return new Promise((resolve, reject) => {
      myengine.render(fullpath, locals, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
};
```

These methods receive three arguments, `renderString` will pass tpl as the first argument instead of name in `render`.

`render(name, locals, viewOptions)`

- name: the file path that can resolve from root (`app/view` by default)
- locals: data used by template
- viewOptions: the view options for each render, it can override the view default config in `config/config.default.js`. Plugin should implement it if it has config.
  When you implement view engine, you will receive this options from `render`, the options contain:
  - root: egg-view will resolve the name to full path, but seperating root and name in viewOptions.
  - name: the original name when call render
  - locals: the original locals when call render

`renderString(tpl, locals, viewOptions)`

- tpl: the template string instead of the file, using in `renderString`
- locals: same as `render`
- viewOptions: same as `render`

### Register

After define a view engine, you can register it.

```js
// app.js
module.exports = app => {
  app.view.use('myName', require('./lib/view'));
};
```

You can define a view engine name, normally it's a template name.

### Configure

Define plugin name and depend on [egg-view]

```json
{
  "eggPlugin": {
    "name": "myName",
    "dependencies": [ "view" ]
  }
}
```

Set default config in `config/config.default.js`, the name is equals to plugin name.

```js
exports.myName = {},
```

See some examples

- [egg-view-ejs]
- [egg-view-nunjucks]

## Configuration

### Root

Root is `${baseDir}/app/view` by default, but you can define multiple directory, seperated by `,`. [egg-view] will find a file from all root directories.

```js
module.exports = appInfo => {
  const baseDir = appInfo.baseDir;
  return {
    view: {
      root: `${baseDir}/app/view,${baseDir}/app/view2`
    }
  }
}
```

### defaultExtension

When render a file, you should specify a extension that let [egg-view] know whitch engine you want to use. However you can define `defaultExtension` without write the extension.

```js
// config/config.default.js
exports.view = {
  defaultExtension: '.html',
};

// controller
module.exports = app => {
  return class UserController extends app.Controller {
    * list() {
      const { ctx } = this;
      // render user.html
      yield ctx.render('user');
    }
  };
};
```

### viewEngine and defaultViewEngine

If you are using `renderString`, you should specify viewEngine in view config, see example above.

However, you can define `defaultViewEngine` without set each time.

```js
// config/config.default.js
exports.view = {
  defaultViewEngine: 'ejs',
};
```

see [config/config.default.js](https://github.com/eggjs/egg-view/blob/master/config/config.default.js) for more detail.

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](https://github.com/eggjs/egg-view/blob/master/LICENSE)


[eggjs]: https://eggjs.org
[ejs]: https://github.com/mde/ejs
[egg-view-ejs]: https://github.com/eggjs/egg-view-ejs
[egg-view]: https://github.com/eggjs/egg-view
[nunjucks]: http://mozilla.github.io/nunjucks
[egg-view-nunjucks]: https://github.com/eggjs/egg-view-nunjucks
