import { Application, Context, PlainObject } from "egg";

declare class ViewBase {
  /**
   * Render a file by view engine
   * @param {String} name - the file path based on root
   * @param {Object} [locals] - data used by template
   * @param {Object} [options] - view options, you can use `options.viewEngine` to specify view engine
   * @return {Promise<String>} result - return a promise with a render result
   */
  render(name: string, locals?: any, options?: any): Promise<string>;

  /**
   * Render a template string by view engine
   * @param {String} tpl - template string
   * @param {Object} [locals] - data used by template
   * @param {Object} [options] - view options, you can use `options.viewEngine` to specify view engine
   * @return {Promise<String>} result - return a promise with a render result
   */
  renderString(name: string, locals?: any, options?: any): Promise<string>;
}

declare class ViewManager extends Map<string, any> {
  constructor(app: Application);
  use(name: string, viewEngine: ViewBase): void;
  resolve(name: string): Promise<string>;
}

declare class ContextView extends ViewBase {
  app: Application;
  viewManager: ViewManager;
  constructor(ctx: Context);
}

declare module "egg" {
  interface Application {
    view: ViewManager;
  }

  interface Context extends ViewBase {
    view: ContextView;
  }

  interface EggAppConfig {
    view: {
      root: string;
      cache: boolean;
      defaultExtension: string;
      defaultViewEngine: string;
      mapping: PlainObject<string>;
    }
  }
}
