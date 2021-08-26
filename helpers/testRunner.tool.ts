import cp from "child_process";
import fs from "fs";
import {magicStrings} from "./magicStrings.helper";
import {testRetryHelper} from "./testRetry.helper";
import {config} from "dotenv";


config();
const {testRetry} = process.env;
let retryCount = Number(testRetry);
testRetryHelper.set([]);

void async function main() {
  do {
    try {
      const testRetryData = testRetryHelper.data;
      if (process.env.isRetry) {
        process.env.CISpecNames = Object.keys(testRetryData[testRetryData.length - 1]).join(',');
        if (!process.env.CISpecNames) {
          process.exit(13);
        }
      }
      cp.execSync(`mocha --config ./dist/mocha.config.js`, {
        stdio: 'inherit',
        env: process.env,
      });
      process.exit(isTestRunFailed() ? 1 : 0);
    } catch (err) {
      process.env.isRetry = 'true';
      testRetryHelper.writeGatheredData();
      if (!retryCount) {
        console.error(err);
        process.exit(1);
      }
    }
  } while (retryCount--);
}();


function isTestRunFailed() {
  return fs.existsSync(magicStrings.path.testRunIsFailed);
}
