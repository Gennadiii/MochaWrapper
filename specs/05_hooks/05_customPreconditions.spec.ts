import {expect} from "chai";
import {suite} from "./suite.helper";


suite({
  name: ['Preconditions'],
  beforeAllSpecs: () => {
    throw new Error('Something bad happened');
  },
  specs: [
    {
      name: 'test 1',
      async test() {
        expect(true).to.be.true;
      },
    },
    {
      name: 'test 2',
      async test() {
        expect(true).to.be.true;
      },
    },
  ],
});
