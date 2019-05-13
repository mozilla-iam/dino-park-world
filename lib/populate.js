import Loader from "./loader";
import { logger } from "./config";

async function populate(files, storage) {
  const loader = new Loader(files);
  const cities = await loader.cities();
  let chunk = [];
  const chunkSize = 100;
  for await (const city of cities) {
    chunk.push(city);
    if (chunk.length === chunkSize) {
      await storage.bulkIndex(chunk);
      chunk = [];
    }
  }
  if (chunk.length > 0) {
    await storage.bulkIndex(chunk);
  }
}

export { populate as default };
