import {expect} from "chai";
import {suite} from "./suite.helper";


suite({
  name: ['Disable tests', 'Skip'],
  specs: [
    {
      xname: 'test 1',
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
