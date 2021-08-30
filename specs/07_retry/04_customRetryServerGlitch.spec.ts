import {expect} from "chai";
import fs from "fs";
import {suite} from "./suite.helper";


const filePath = './retryCustomTestData';
setTimeout(() => fs.existsSync(filePath) || fs.writeFileSync(filePath, '42'), 42);

suite({
  name: ['Retry', 'Server glitch'],
  specs: [
    {
      name: 'test 1',
      retryOnAssertionFail: true,
      async test() {
        console.log(`1`.repeat(30));
        expect(fs.readFileSync(filePath).toString()).to.eq('42');
      },
    },
    {
      name: 'test 2',
      async test() {
        await sleep(420);
        // throw new Error('Some error'); // to show retry data
        expect(true).to.be.true;
      },
    },
  ],
});


function sleep(timeout) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}
