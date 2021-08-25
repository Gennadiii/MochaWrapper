import {expect} from "chai";
import {suite} from "./suite.helper";


const someDataThatHasToBeCleaned = {};

suite({
  name: ['After test'],
  afterAllSpecs: () => console.info(someDataThatHasToBeCleaned),
  specs: [
    {
      name: 'test 1',
      async test() {
        someDataThatHasToBeCleaned['testData'] = 42;
        throw new Error('Unexpected error');
      },
      async afterTest() {
        delete someDataThatHasToBeCleaned['testData'];
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
