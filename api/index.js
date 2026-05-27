const app = require("../backend/server");

module.exports = async (req, res) => {
  req.path = req.url.split("?")[0];
  req.query = Object.fromEntries(new URL(req.url, "http://localhost").searchParams);
  return app(req, res);
};
