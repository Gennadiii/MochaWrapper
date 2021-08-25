import {expect} from "chai";
import {usersHelper} from "./users.helper";


let user = null;

describe('Users handler', () => {
  before(() => {
    user = usersHelper.allocate();
  });
  after(() => user.free());
  it('test 1', () => {
    expect(true).to.be.true;
  });
  it('test 2', () => {
    expect(true).to.be.true;
  });
});
