import fs from "fs";
import {magicStrings} from "./magicStrings.helper";


export const testRetryHelper = {
  get testRetry(): testRetry {
    return JSON.parse(fs.readFileSync(magicStrings.path.retry).toString());
  },
  set(data: testRetry): void {
    fs.writeFileSync(magicStrings.path.retry, JSON.stringify(data));
  },
  setTemp(data: testTempRetry): void {
    if (!fs.existsSync(magicStrings.path.retryTempDir)) {
      fs.mkdirSync(magicStrings.path.retryTempDir);
    }
    fs.writeFileSync(`${magicStrings.path.retryTempDir}/${process.pid.toString()}`, JSON.stringify(data));
  },
  writeGatheredData(): void {
    const retryData = this.testRetry;
    retryData.push(this.gatherTempData());
    fs.writeFileSync(magicStrings.path.retry, JSON.stringify(retryData));
  },
  gatherTempData(): testTempRetry {
    const result = {};
    if (!fs.existsSync(magicStrings.path.retryTempDir)) {
      return result;
    }
    const files = fs.readdirSync(magicStrings.path.retryTempDir);
    files.forEach(file => {
      const dataObj: testTempRetry = JSON.parse(
        fs.readFileSync(`${magicStrings.path.retryTempDir}/${file}`).toString());
      const [filePath, failedTests] = Object.entries(dataObj)[0];
      result[filePath] = failedTests;
    });
    fs.rmdirSync(magicStrings.path.retryTempDir, {recursive: true});
    return result;
  },
};

type testTempRetry = Record<string, string[]>;
type testRetry = testTempRetry[];
