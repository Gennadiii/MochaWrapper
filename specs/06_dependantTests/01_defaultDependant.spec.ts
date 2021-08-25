import {expect} from "chai";


let creationError = null;

describe('Dependant tests', () => {
  it('create entity', () => {
    try {
      throw new Error(`Failed to create entity`);
    } catch (err) {
      creationError = err;
      throw err;
    }
  });
  it('delete entity', () => {
    if (creationError) {
      throw creationError;
    }
    expect(true).to.be.true;
  });
});
