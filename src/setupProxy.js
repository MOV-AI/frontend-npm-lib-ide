const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware({
      target: "http://localhost:3333",
      ws: true,
      logLevel: "debug",
      secure: false,
      pathFilter: ["/lsp/languageServer/**"],
    }),
  );

  app.use(
    createProxyMiddleware({
      target: "https://localhost",
      ws: true,
      logLevel: "debug",
      secure: false,
      pathFilter: [
        "/token-auth/**",
        "/api/**",
        "/domains/**",
        "/token-verify/**",
        "/token-refresh/**",
        "/ws/**",
        "/logout/**",
        "/static/maps/**",
        "/static/meshes/**",
        "/static/point_clouds/**",
      ],
    }),
  );
};
