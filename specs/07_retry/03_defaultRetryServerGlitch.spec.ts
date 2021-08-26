import {expect} from "chai";
import fs from "fs";


const filePath = './retryDefaultTestData';
setTimeout(() => fs.existsSync(filePath) || fs.writeFileSync(filePath, '42'), 42);


describe('Retry', function() {
  this.retries(1);
  describe('Server glitch', () => {
    it('test 1', () => {
      console.log(`1`.repeat(30));
      expect(fs.readFileSync(filePath).toString()).to.eq('42');
    });
    it('test 2', async () => {
      await sleep(420);
      expect(true).to.be.true;
    });
  });
});


function sleep(timeout) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}
