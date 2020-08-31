import populate from "./populate";

class Handlers {
  constructor(storage) {
    this.storage = storage;
  }

  createPopulateHandler() {
    return (req, res) => {
      const files = req.body;
      populate(files, this.storage)
        .then(() => res.json({ status: "done" }))
        .catch((e) => {
          res.status(503);
          res.json({ error: e });
        });
    };
  }

  createSuggestHandler() {
    return (req, res) => {
      const s = req.query.s || "";
      this.storage
        .suggest(s)
        .then((r) => {
          res.json(r);
        })
        .catch((e) => {
          res.status(503);
          res.json({ error: e });
        });
    };
  }

  createRecreateHandler() {
    return (_, res) => {
      this.storage
        .recreateIndices()
        .then((r) => {
          res.json(r);
        })
        .catch((e) => {
          res.status(503);
          res.json({ error: e });
        });
    };
  }
}

export { Handlers as default };
