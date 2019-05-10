import fs from "fs";
import readline from "readline";

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
    if (city && country && region && population) {
      yield {
        country: countries.get(country),
        region: adminCodes.get(`${country}.${region}`),
        city,
        population
      };
    }
  }
}

class Loader {
  constructor(cfg) {
    this.cfg = cfg;
  }

  async loadAdminCodes() {
    let adminCodesStream = fs.createReadStream(this.cfg.adminCodesFile);
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

  async loadCountries() {
    let countriesStream = fs.createReadStream(this.cfg.countriesFile);
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
    let adminCodes = await this.loadAdminCodes();
    let countries = await this.loadCountries();
    return cityIter(adminCodes, countries, this.cfg.citiesFile);
  }
}

export { Loader as default };
