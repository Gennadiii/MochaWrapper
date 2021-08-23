import {expect} from "chai";
import {suite} from "./suite.helper";


suite({
  name: ['Disable tests', 'Disable'],
  specs: [
    {
      name: 'test 1',
      disable: {
        reason: 'Reason 1',
        link: 'https://jira.net/gbrowse/CQA-453',
      },
      async test() {
        expect(true).to.be.true;
      },
    },
    {
      name: 'test 2',
      disable: {
        reason: 'Reason 2',
        link: 'https://corvaqa.atlassian.net/browse/CQA-453',
        env: 'qa',
      },
      async test() {
        expect(true).to.be.true;
      },
    },
  ],
});
