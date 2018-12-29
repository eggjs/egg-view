import { Application } from 'egg';

export default (app: Application) => {
  app.view.use('newEngine', {
    render: async () => '666',
    renderString: async () => '666',
  });
}
