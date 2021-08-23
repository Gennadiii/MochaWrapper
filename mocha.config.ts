import {testsSelector} from "./helpers/testsSelector.tool";


module.exports = {
  diff: true,
  reporter: 'spec',
  slow: "75",
  ui: "bdd",
  spec: testsSelector.getTestsFromFile(),
  color: true
};
