import fs from "fs";
import readline from "readline";
import { logger } from "./config";

async function* cityIter(adminCodes, countries, citiesFile) {
  let citiesStream = fs.createReadStream(citiesFile);
  const rl = readline.createInterface({
    input: citiesStream,
    crlfDelay: Infinity
  });
  for await (const line of rl) {
    const tabs = line.split("\t");
    const city = tabs[1];
    const country = tabs[8];
    const region = tabs[10];
    const population = parseInt(tabs[14]) || 0;
    const timezone = tabs[17] || "UTC";
    if (city && country && region && population) {
      yield {
        country: countries.get(country),
        region: adminCodes.get(`${country}.${region}`),
        city,
        population,
        timezone
      };
    }
  }
}

class Loader {
  constructor({ adminCodesFile, countriesFile, citiesFile }) {
    this.adminCodesFile = adminCodesFile;
    this.countriesFile = countriesFile;
    this.citiesFile = citiesFile;
  }

  async _check() {
    const fsp = fs.promises;
    try {
      await fsp.access(this.adminCodesFile, fs.constants.R_OK);
      await fsp.access(this.countriesFile, fs.constants.R_OK);
      await fsp.access(this.citiesFile, fs.constants.R_OK);
    } catch (e) {
      logger.error(`unable to read files: ${e}`);
      throw e;
    }
  }

  async _loadAdminCodes() {
    let adminCodesStream = fs.createReadStream(this.adminCodesFile);
    let adminCodeMap = new Map();
    const rl = readline.createInterface({
      input: adminCodesStream,
      crlfDelay: Infinity
    });
    for await (const line of rl) {
      const [code, name] = line.split("\t");
      if (code && name) {
        adminCodeMap.set(code, name);
      }
    }
    return adminCodeMap;
  }

  async _loadCountries() {
    let countriesStream = fs.createReadStream(this.countriesFile);
    let countriesMap = new Map();
    const rl = readline.createInterface({
      input: countriesStream,
      crlfDelay: Infinity
    });
    for await (const line of rl) {
      if (line.startsWith("#")) {
        continue;
      }
      const [code, , , , name] = line.split("\t");
      if (code && name) {
        countriesMap.set(code, name);
      }
    }
    return countriesMap;
  }

  async cities() {
    await this._check();
    let adminCodes = await this._loadAdminCodes();
    let countries = await this._loadCountries();
    return cityIter(adminCodes, countries, this.citiesFile);
  }
}

export { Loader as default };
