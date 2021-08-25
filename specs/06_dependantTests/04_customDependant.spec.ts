import {expect} from "chai";
import {suite} from "./suite.helper";


let createdEntity = null;

suite({
  name: ['Disable Dependant tests'],
  specs: [
    {
      name: 'create entity',
      disable: {
        reason: 'Bug'
      },
      async test() {
        throw new Error(`Failed to create entity`);
        createdEntity = 42;
      },
      dependantTests: [
        {
          name: 'delete entity',
          async test() {
            expect(createdEntity).to.eq(42);
          },
        },
      ],
    },
  ],
});
