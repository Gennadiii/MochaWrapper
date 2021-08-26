import {expect} from "chai";
import {suite} from "./suite.helper";


let counter = 0;

suite({
  name: ['Retry'],
  specs: [
    {
      name: 'test 1', // comment this one to get a green job
      // retryOnAssertionFail: true,
      async test() {
        console.log(`1`.repeat(30));
        expect(counter++).to.eq(3);
      },
    },
    {
      name: 'test 2',
      async test() {
        console.log(`2`.repeat(30));
        expect(counter++).to.eq(1);
        // expect(counter++).to.eq(0);
      },
    },
    {
      name: 'test 3',
      async test() {
        console.log(`3`.repeat(30));
        if (!(counter === 0)) {
          throw new Error('The error which has to be retried');
        }
        expect(true).to.be.true;
      },
    },
  ],
});
