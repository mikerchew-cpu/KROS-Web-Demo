import { createServer } from "http";
import { parse } from "url";
import app from "./server";

export default function handler(req, res) {
  const parsedUrl = parse(req.url, true);
  req.query = parsedUrl.query;
  req.path = parsedUrl.pathname;
  return app(req, res);
}
