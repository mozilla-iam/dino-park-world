import convict from "convict";
import { SCHEMA } from "../lib/config";

function load(configObject) {
  const config = convict(SCHEMA);
  config.load(configObject);
  config.validate({ allowed: "strict" });
  return config.getProperties();
}

const TEST_CONFIG = load({
  port: 8080,
  shutdownTimeout: 10,
  elasticHost: "localhost:9200",
  citiesFile: "test/data/cities500.txt",
  countriesFile: "test/data/countryInfo.txt",
  adminCodesFile: "test/data/admin1CodesASCII.txt"
});

export { TEST_CONFIG };
