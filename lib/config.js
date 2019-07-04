import winston from "winston";
import convict from "convict";

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.simple()
  )
});

const SCHEMA = {
  port: {
    doc: "The port to bind.",
    format: "port",
    default: 8890,
    env: "PORT",
    arg: "port"
  },
  shutdownTimeout: {
    doc: "Grace period after SIGINT/SIGTERM.",
    format: "duration",
    default: 1000,
    env: "SHUTDOWN_TIMEOUT"
  },
  basePath: {
    doc: "Base path for API endpoints.",
    format: "String",
    default: "/",
    env: "BASE_PATH"
  },
  elasticHost: {
    doc: "ES host with port.",
    format: "String",
    default: null,
    env: "ELASTIC_HOST"
  },
  elasticAwsDefaultRegion: {
    doc: "Use AWS ES with default region.",
    format: "String",
    default: "",
    env: "AWS_DEFAULT_REGION"
  },
  elasticIndex: {
    doc: "ES index name.",
    format: "String",
    default: "v1-dino-park-world",
    env: "ELASTIC_INDEX"
  },
  elasticWriteIndex: {
    doc: "ES wrtie index name.",
    format: "String",
    default: "v1-dino-park-world",
    env: "ELASTIC_WRITE_INDEX"
  },
  adminCodesFile: {
    doc: "File containing GeoNames admin codes.",
    format: "String",
    default: "admin1CodesASCII.txt",
    env: "ADMIN_CODES_FILE"
  },
  countriesFile: {
    doc: "File containing GeoNames countries.",
    format: "String",
    default: "countryInfo.txt",
    env: "COUNTRIES_FILE"
  },
  citiesFile: {
    doc: "File containing GeoNames cities.",
    format: "String",
    default: "cities15000.txt",
    env: "CITIES_FILE"
  }
};

function load(configFile) {
  const CONFIG = convict(SCHEMA);
  try {
    if (configFile) {
      CONFIG.loadFile(configFile);
    }
    CONFIG.validate({ allowed: "strict" });
    return CONFIG.getProperties();
  } catch (e) {
    throw new Error(`error reading config: ${e}`);
  }
}

export { load, logger, SCHEMA };
