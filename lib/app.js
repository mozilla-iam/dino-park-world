import http from "http";
import path from "path";

import express from "express";
import bodyParser from "body-parser";

import { logger } from "./config";
import Handlers from "./handlers";
import Storage from "./storage";

class App {
  constructor(cfg) {
    this.port = cfg.port;
    this.basePath = cfg.basePath;
    this.shutdownTimeout = cfg.shutdownTimeout;
    this.app = express();
    this.app.use(bodyParser.json());
  }

  _base(_path) {
    const p = path.join(this.basePath, _path);
    logger.info(`mounting ${p}`);
    return p;
  }

  async init(cfg) {
    const storage = await new Storage(cfg).init();
    const handlers = new Handlers(storage);

    this.app.get("/healthz", (_, res) => res.end());
    this.app.get(this._base("/world/suggest"), handlers.createSuggestHandler());
    this.app.post(
      this._base("/world/populate"),
      handlers.createPopulateHandler()
    );
    this.app.post(
      this._base("/world/recreate"),
      handlers.createRecreateHandler()
    );
  }

  run() {
    this.server = http.createServer(this.app);
    return this.server.listen(this.port);
  }

  stop() {
    let timer;
    const killer = new Promise((_, reject) => {
      timer = setTimeout(
        () => reject(new Error("timed out closing http server")),
        this.shutdownTimeout
      );
    });
    const close = new Promise(resolve =>
      this.server.close(() => {
        clearTimeout(timer);
        resolve();
      })
    );
    return Promise.race([close, killer]);
  }
}

export { App as default };
