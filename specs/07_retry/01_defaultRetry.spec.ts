import {expect} from "chai";


let counter = 0;

describe('Retry', function() {
  this.retries(2);
  it('test 1', () => {
    console.log(`1`.repeat(30));
    expect(counter++).to.eq(2);
  });
  it('test 2', () => {
    console.log(`2`.repeat(30));
    expect(counter++).to.eq(3);
  });
  it('test 3', () => {
    console.log(`3`.repeat(30));
    if (!(counter++ === 5)) {
      throw new Error('The error which has to be retried');
    }
    expect(true).to.be.true;
  });
});
