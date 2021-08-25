import {expect} from "chai";


let creationError = null;
let createdEntity = null;

describe('Disable Dependant tests', () => {
  xit('create entity', () => {
    try {
      throw new Error(`Failed to create entity`);
      createdEntity = 42;
    } catch (err) {
      creationError = err;
      throw err;
    }
  });
  it('delete entity', () => {
    if (creationError) {
      throw creationError;
    }
    expect(createdEntity).to.eq(42);
  });
});
