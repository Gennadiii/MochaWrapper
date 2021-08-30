import {testsSelector} from "./helpers/testsSelector.tool";
import {config} from "dotenv";


config();
const {CISpecNames} = process.env;
module.exports = {
  diff: true,
  reporter: 'spec',
  slow: "75",
  ui: "bdd",
  spec: CISpecNames ? CISpecNames.split(',') : testsSelector.getTestsFromFile(),
  color: true
};
