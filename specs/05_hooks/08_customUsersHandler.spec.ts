import {expect} from "chai";
import {suite} from "./suite.helper";
import {usersHelper} from "./users.helper";


let user = null;

suite({
  name: ['Users handler'],
  users: () => [user = usersHelper.allocate()],
  specs: [
    {
      name: 'test 1',
      async test() {
        expect(true).to.be.true;
      },
    },
    {
      name: 'test 2',
      async test() {
        expect(true).to.be.true;
      },
    },
  ],
});
