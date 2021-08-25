import {expect} from "chai";


describe('Disable tests', () => {
  describe('Skip', () => {
    it.skip('test 1', () => {
      expect(true).to.be.true;
    });
    it('test 2', () => {
      expect(true).to.be.true;
    });
    xit('test 3', () => {
      expect(true).to.be.true;
    });
  });
});
