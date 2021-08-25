import {expect} from "chai";


const someDataThatHasToBeCleaned = {};

describe('After test', () => {
  after(() => console.info(someDataThatHasToBeCleaned));
  it('test 1', () => {
    try {
      someDataThatHasToBeCleaned['testData'] = 42;
      throw new Error('Unexpected error');
    } finally {
      delete someDataThatHasToBeCleaned['testData'];
    }
  });
  it('test 2', () => {
    expect(true).to.be.true;
  });
});
