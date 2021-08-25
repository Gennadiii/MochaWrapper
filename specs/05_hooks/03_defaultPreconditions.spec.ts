import {expect} from "chai";


describe('Preconditions', () => {
  before(() => {
    // no data about tests so counter in report is wrong and TestRail doesn't get filled
    throw new Error('Something bad happened');
  });
  it('test 1', () => {
    expect(true).to.be.true;
  });
  it('test 2', () => {
    expect(true).to.be.true;
  });
});
