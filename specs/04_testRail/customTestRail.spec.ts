import {expect} from "chai";
import {suite} from "./suite.helper";


suite({
  name: ['TestRail integration'],
  testRailSuiteId: 42,
  specs: [
    {
      name: 'test 1',
      testRailId: 18,
      async test() {
        expect(true).to.be.true;
      },
    },
    {
      name: 'test 2',
      testRailId: 7,
      async test() {
        expect(true).to.be.true;
      },
    },
  ],
});
