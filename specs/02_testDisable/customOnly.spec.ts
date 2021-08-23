import {expect} from "chai";
import {suite} from "./suite.helper";


suite({
  name: ['Disable tests', 'Only'],
  specs: [
    {
      name: 'test 1',
      async test() {
        expect(true).to.be.true;
      },
    },
    {
      fname: 'test 2',
      async test() {
        expect(true).to.be.true;
      },
    },
  ],
});
