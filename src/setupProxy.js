const { createProxyMiddleware } = require('http-proxy-middleware');

const API_PORT = process.env.API_PORT || 3001;

module.exports = function (app) {
  app.use(
    '/.netlify/functions',
    createProxyMiddleware({
      target: `http://localhost:${API_PORT}`,
      changeOrigin: true,
      // Express strips the mount path before proxying, so restore the full Netlify path.
      pathRewrite: (path) => `/.netlify/functions${path}`,
    })
  );
};
