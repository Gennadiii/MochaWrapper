import fs from "fs";
import {magicStrings} from "../../helpers/magicStrings.helper";
import {stringHelper} from "../../helpers/string.helper";
import {testRetryHelper} from "../../helpers/testRetry.helper";


let specException = null;
const testRetryData = testRetryHelper.data;
const currentRunRetryData = {};
const previousRunRetryData = process.env.isRetry && testRetryData[testRetryData.length - 1];


export function suite(params: suiteInterface): void {
  const {name, specs} = params;
  let {
    retryOnAssertionFail = stringHelper.toBoolean(process.env.retryOnAssertionFail),
  } = params;

  const reducedName = [...name];
  const inner = reducedName.pop();

  describe(`${getEnv()}_<-${getBrowserName()}->`, () => {
    reducedName.reduceRight((prev, cur) => {
      return () => describe(cur, () => {
        prev();
      });
    }, () => describe(inner, function() {
      console.info(`Tests "${specs.map(spec => spec.name).join(', ')}" running on pid: ${process.pid}`);

      executeTests({specs, retryOnAssertionFail, specPath: this.file});
    }))();
  });
}


function getSpecsToExecute(params: getSpecsToExecuteInterface): testInterface[] {
  const {specPath, specs} = params;
  return specs
    .filter(spec => previousRunRetryData
      ? previousRunRetryData[specPath].includes(spec.name)
      : true);
}

function executeTest(params: executeTestInterface) {
  const {isDependant, parentSpecName, spec, suiteRetryOnAssertionFail} = params;
  const {
    name: specName,
    test,
    retryOnAssertionFail = suiteRetryOnAssertionFail,
    dependantTests,
  } = spec;
  if (!isDependant) {
    specException = null;
  }
  it(specName, async function() {
    try {
      if (isDependant && specException) {
        throw new Error(`Precondition failed: ${specException}`);
      }
      await test();
      specException = null;
    } catch (err) {
      if (isAssertionError(err) && !retryOnAssertionFail) {
        fs.existsSync(magicStrings.path.testRunIsFailed) || fs.writeFileSync(magicStrings.path.testRunIsFailed, '');
      }
      if (retryOnAssertionFail || !isAssertionError(err)) {
        console.trace(`Adding test for retry [${specName}${isDependant ? `, ${parentSpecName}` : ''}]`);
        writeFailedInfo(this['_runnable'].file, specName);
        isDependant && writeFailedInfo(this['_runnable'].file, parentSpecName);
        dependantTests && dependantTests
          .forEach(dependantTest => writeFailedInfo(this['_runnable'].file, dependantTest.name));
      }
      if (!isDependant) {
        specException = err;
      }
      throw err;
    }
  });
}

function executeTests(params: executeTestsInterface) {
  const {
    isDependant,
    parentSpecName,
    retryOnAssertionFail,
    specPath,
    specs,
  } = params;
  getSpecsToExecute({specs, specPath})
    .forEach(spec => {
      const {dependantTests} = spec;
      executeTest({
        spec,
        suiteRetryOnAssertionFail: retryOnAssertionFail,
        isDependant,
        parentSpecName,
      });
      if (dependantTests) {
        executeTests({
          specs: dependantTests,
          retryOnAssertionFail,
          specPath,
          isDependant: true,
          parentSpecName: spec.name,
        });
      }
    });
}


function getEnv(): string {
  return 'staging';
}

function getBrowserName(): string {
  return 'chrome';
}


function writeFailedInfo(specPath: string, testName: string): void {
  currentRunRetryData[specPath]
    ? currentRunRetryData[specPath].push(testName)
    : currentRunRetryData[specPath] = [testName];
  testRetryHelper.setTemp(currentRunRetryData);
}

function isAssertionError(err: Error): boolean {
  return err.name === 'AssertionError' || err.message.includes('AssertionError');
}


interface dependantTestInterface {
  name: string;
  test: () => Promise<void>;
  retryOnAssertionFail?: boolean;
}


interface testInterface extends dependantTestInterface {
  dependantTests?: dependantTestInterface[];
}


interface suiteInterface {
  name: string[];
  specs: testInterface[];
  retryOnAssertionFail?: boolean;
}


interface getSpecsToExecuteInterface {
  specs: testInterface[];
  specPath: string;
}


interface executeTestInterface {
  spec: testInterface;
  suiteRetryOnAssertionFail: boolean;
  isDependant?: boolean;
  parentSpecName?: string;
}


interface executeTestsInterface {
  specs: testInterface[],
  retryOnAssertionFail: boolean;
  specPath: string;
  isDependant?: boolean;
  parentSpecName?: string;
}
