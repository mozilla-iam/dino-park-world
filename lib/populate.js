import Loader from "./loader";
import { logger } from "./config";

async function populate(files, storage) {
  const loader = new Loader(files);
  const cities = await loader.cities();
  let chunk = [];
  const chunkSize = 100;
  let count = 0;
  for await (const city of cities) {
    chunk.push(city);
    if (chunk.length === chunkSize) {
      await storage.bulkIndex(chunk);
      count += chunkSize;
      logger.info(`processed ${count}`);
      chunk = [];
    }
  }
  if (chunk.length > 0) {
    try {
      await storage.bulkIndex(chunk);
      count += chunk.length;
    } catch (e) {
      logger.error(e);
      logger.info("retrying");
      await storage.bulkIndex(chunk);
      count += chunk.length;
    }
    logger.info(`processed ${count}`);
  }
  logger.info("done processing cities");
}

export { populate as default };
