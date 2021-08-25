import {expect} from "chai";
import {suite} from "./suite.helper";


suite({
  name: ['Dependant tests'],
  specs: [
    {
      name: 'create entity',
      async test() {
        throw new Error(`Failed to create entity`);
      },
      dependantTests: [
        {
          name: 'delete entity',
          async test() {
            expect(true).to.be.true;
          },
        },
      ],
    },
  ],
});
