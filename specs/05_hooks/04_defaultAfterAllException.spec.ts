import {expect} from "chai";


describe('After all exception', () => {
  after(() => {
    throw new Error(`Something went wrong but that's not a big problem`);
  });
  it('test', () => {
    expect(true).to.be.true;
  });
});
