import elasticsearch from "elasticsearch";
import connectionClass from "http-aws-es";

import { logger } from "./config";

const DOC_MAPPING = {
  _doc: {
    properties: {
      suggest: { type: "completion" },
      city: { type: "text" },
      region: { type: "text" },
      country: { type: "text" },
      population: { type: "long" },
      timezone: { type: "text" }
    }
  }
};

function toDoc(city) {
  return {
    suggest: [
      {
        input: [
          `${city.city}`,
          `${city.city} ${city.country}`,
          `${city.city} ${city.region}`,
          `${city.city} ${city.region} ${city.country}`,
          `${city.country} ${city.city}`,
          `${city.country} ${city.region} ${city.city}`,
          `${city.region}`,
          `${city.region} ${city.city}`
        ],
        weight: city.population
      }
    ],
    ...city
  };
}

class Storage {
  constructor(cfg, esClient = elasticsearch.Client) {
    this.cfg = cfg;
    const options = {
      host: this.cfg.elasticHost
    };
    if (cfg.elasticAwsDefaultRegion !== "") {
      options.connectionClass = connectionClass;
    }
    this.client = new esClient(options);
    this.deleteConfirmationTimer = null;
    this.index = cfg.elasticIndex;
    this.writeIndex = cfg.elasticWriteIndex;
  }

  async init() {
    await this.createIndex(this.index);
    await this.createIndex(this.writeIndex);
  }

  async createIndex(index) {
    logger.info(`checking index: ${index}`);
    const exists = await this.client.indices.exists({ index });
    if (!exists) {
      logger.info(`creating index: ${index}`);
      await this.client.indices.create({
        index,
        body: { mappings: DOC_MAPPING }
      });
    }
    return this;
  }

  async bulkIndex(docs) {
    const bulk = docs.flatMap(doc => [
      { index: { _index: this.writeIndex, _type: "_doc" } },
      toDoc(doc)
    ]);
    return this.client.bulk({ body: bulk });
  }

  async suggest(term) {
    logger.info(`suggesting for: ${term}`);
    const suggestions = await this.client.search({
      index: this.index,
      type: "_doc",
      body: {
        suggest: {
          city_suggest: {
            prefix: term,
            completion: {
              field: "suggest"
            }
          }
        }
      }
    });
    const {
      suggest: {
        city_suggest: [{ options: cities } = { options: [] }]
      }
    } = suggestions;
    return cities.map(({ _source: { country, region, city, timezone } }) => {
      return { country, region, city, timezone };
    });
  }

  async recreateIndices() {
    if (this.deleteConfirmationTimer !== null) {
      clearTimeout(this.deleteConfirmationTimer);
      this.deleteConfirmationTimer = null;
      const params = {
        index: [this.writeIndex]
      };
      logger.info(`deleting ${JSON.stringify(params)}`);
      try {
        await this.client.indices.delete(params);
        await this.init();
      } catch (e) {
        logger.error(e);
      }
      return { recreate: "done" };
    } else {
      this.deleteConfirmationTimer = setTimeout(() => {
        logger.warn("recreation not confirmed");
        this.deleteConfirmationTimer = null;
      }, 2000);
      return { recreate: "confirm please" };
    }
  }
}

export { Storage as default };
