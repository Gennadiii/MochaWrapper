import {expect} from "chai";


describe('Disable tests', () => {
  describe('Only', () => {
    it('test 1', () => {
      expect(true).to.be.true;
    });
    it.only('test 2', () => {
      expect(true).to.be.true;
    });
  });
});
