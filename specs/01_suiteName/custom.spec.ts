import {expect} from "chai";
import {suite} from "./suite.helper";


suite({
  name: ['Feature', 'SubFeature', 'SubSubFeature'],
  specs: [
    {
      name: 'test',
      async test() {
        expect(true).to.be.true;
      },
    }
  ],
});
