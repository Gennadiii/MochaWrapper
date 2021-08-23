import TestsSelector from "tests-selector";
import {config} from "dotenv";


config();
const {CISpecNames} = process.env;

export const testsSelector = new TestsSelector({
  tempDataPath: `${process.cwd()}/dist`,
  specsPath: `${process.cwd()}/dist/specs`,
});


if (require.main === module) {
  void async function() {
    if (CISpecNames) {
      return;
    }
    await testsSelector.selectTests();
  }();
}
