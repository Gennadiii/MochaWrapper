import {expect} from "chai";
import {suite} from "./suite.helper";


suite({
  name: ['Repeat tests'],
  specs: [
    {
      name: 'potentially flaky',
      repeat: 10,
      async test() {
        expect(true).to.be.true;
      },
    },
  ],
});
