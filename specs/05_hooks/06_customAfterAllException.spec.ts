import {expect} from "chai";
import {suite} from "./suite.helper";


suite({
  name: ['After all exception'],
  afterAllSpecs: () => {
    throw new Error(`Something went wrong but that's not a big problem`);
  },
  specs: [
    {
      name: 'test',
      async test() {
        expect(true).to.be.true;
      },
    },
  ],
});
