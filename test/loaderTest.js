import { TEST_CONFIG } from "./configs";
import Loader from "../lib/loader";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
chai.should();

describe("Loaders", () => {
  describe("admin codes parsing", () => {
    it("read admin codes", async () => {
      const loader = new Loader(TEST_CONFIG);
      const map = await loader.loadAdminCodes();
      map.get("DE.16").should.be.equal("Berlin");
    });
  });
  describe("country parsing", () => {
    it("read countries", async () => {
      const loader = new Loader(TEST_CONFIG);
      const map = await loader.loadCountries();
      map.get("DE").should.be.equal("Germany");
    });
  });
  describe("cities parsing", () => {
    it("iter cities", async () => {
      const loader = new Loader(TEST_CONFIG);
      const cities = await loader.cities();
    });
  });
});
