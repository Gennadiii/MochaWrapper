import {expect} from "chai";
import {suite} from "./suite.helper";


suite({
  name: ['Disable tests', 'Disable'],
  specs: [
    {
      name: 'test 1',
      disable: {
        reason: 'Reason 1',
        link: 'https://jira.net/gbrowse/CQA-18',
      },
      async test() {
        expect(true).to.be.true;
      },
    },
    {
      name: 'test 2',
      disable: {
        reason: 'Reason 2',
        link: 'https://jira.net/gbrowse/CQA-42',
        env: 'qa',
      },
      async test() {
        expect(true).to.be.true;
      },
    },
  ],
});
