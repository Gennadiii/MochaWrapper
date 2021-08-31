import "webdriverio";
import allureReporter from "@wdio/allure-reporter";
import fs from "fs";
import _ from "lodash";
import {magicStrings} from "./helpers/magicStrings.helper";
import {stringHelper} from "./helpers/string.helper";
import {testRetryHelper} from "./helpers/testRetry.helper";
import {userInterface} from "./specs/05_hooks/suite.helper";
import HookFunction = Mocha.HookFunction;


let specException = null;
let preconditionException = null;
const testRetryData = testRetryHelper.data;
const currentRunRetryData = {};
const previousRunRetryData = process.env.isRetry && testRetryData[testRetryData.length - 1];


export function suite(params: suiteInterface): void {
  const {
    name,
    testRailSuiteId,
    users,
    beforeAllSpecs,
    beforeEachSpec,
    afterEachSpec,
    afterAllSpecs,
    specs,
    testRailId: generalTestRailId,
    addBrowserName = true,
  } = params;
  let {
    retryOnAssertionFail = stringHelper.toBoolean(process.env.retryOnAssertionFail),
  } = params;

  if (name.length === 0) {
    throw new Error(`Please specify suite name`);
  }

  const reducedName = [...name];
  const inner = reducedName.pop();
  const baseDescribeName = addBrowserName
    ? `${getEnv()}_<-${getBrowserName()}->`
    : getEnv();

  describe(baseDescribeName, () => {
    reducedName.reduceRight((prev, cur) => {
      return () => describe(cur, () => {
        prev();
      });
    }, () => describe(inner, function() {
      console.info(`Tests "${specs.map(spec => spec.name).join(', ')}" running on pid: ${process.pid}`);

      users && usersHandler({getUsers: users, specs, specFilePath: this.file});

      runPrePostConditions(beforeAllSpecs, before, {specs, specFilePath: this.file, passExceptionToTests: true});
      runPrePostConditions(beforeEachSpec, beforeEach, {specs, specFilePath: this.file, passExceptionToTests: true});
      runPrePostConditions(afterEachSpec, afterEach, {specs, specFilePath: this.file});
      runPrePostConditions(afterAllSpecs, after, {ignoreError: true});

      executeTests({specs, testRailSuiteId, generalTestRailId, retryOnAssertionFail, specPath: this.file});
    }))();
  });
}


function usersHandler(params: usersHandlerInterface) {
  const {getUsers, specFilePath, specs} = params;
  let users: userInterface[];
  runPrePostConditions(
    async () => users = await Promise.all(await getUsers()),
    before, {
      specs,
      specFilePath,
      passExceptionToTests: true
    });
  runPrePostConditions(
    async () => users && await Promise.all(users.map(user => user.free())),
    after,
    {ignoreError: true});
}

function getSpecsToExecute(params: getSpecsToExecuteInterface): testInterface[] {
  const {specPath, specs} = params;
  const forcedTest = specs.find(spec => spec.fname);
  if (forcedTest) {
    console.warn(`Don't forget to remove "fname"`);
    forcedTest.name = forcedTest.fname;
    return [forcedTest];
  }
  return specs
    .map(spec => {
      if (spec.xname) {
        console.warn(`Don't forget to remove "xname"`);
        spec.name = spec.xname;
        spec.disable = {reason: `No reason :(`};
      }
      return spec;
    })
    .filter(spec => previousRunRetryData
      ? previousRunRetryData[specPath].includes(spec.name)
      : true);
}

function executeTest(params: executeTestInterface) {
  const {generalTestRailId, isDependant, parentSpecName, spec, suiteRetryOnAssertionFail, testRailSuiteId} = params;
  const {
    name: specName,
    test,
    afterTest,
    repeat = 1,
    testRailId,
    retryOnAssertionFail = suiteRetryOnAssertionFail,
    dependantTests,
  } = spec;
  let {disable} = spec;
  if (!isDisabled(disable)) {
    disable = null;
  }
  if (!isDependant) {
    specException = null;
  }
  const tmsId = testRailId || generalTestRailId;
  if (!tmsId) {
    console.warn(`No TestRail ID`);
  }
  repeat > 1 && console.warn(`Dont forget to remove "REPEAT"`);
  const testName = `- ${specName}${
    disable ? ` #${disable && disable.reason}` : ''} S${
    testRailSuiteId} C${
    tmsId}`;

  const testFunc = disable ? it.skip : it;

  _.times(repeat, () => testFunc(testName, async function() {
      disable?.link && allureReporter.addIssue(disable.link);
      try {
        console.info(testName.toUpperCase());
        if (preconditionException) {
          throw new Error(`'before(all/each)' failed: ${preconditionException}`);
        }
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
      } finally {
        if (afterTest) {
          console.debug(`Running afterTest`);
          await afterTest();
        }
      }
    })
  );
}

function executeTests(params: executeTestsInterface) {
  const {
    generalTestRailId,
    isDependant,
    parentSpecName,
    retryOnAssertionFail,
    specPath,
    specs,
    testRailSuiteId,
  } = params;
  getSpecsToExecute({specs, specPath})
    .forEach(spec => {
      const {dependantTests} = spec;
      executeTest({
        spec,
        testRailSuiteId,
        generalTestRailId,
        suiteRetryOnAssertionFail: retryOnAssertionFail,
        isDependant,
        parentSpecName,
      });
      if (dependantTests) {
        dependantTests.forEach(test => {
          if (spec.disable) {
            if (!spec.disable.env || spec.disable.env === getEnv()) {
              test.disable = spec.disable;
            }
          }
        });
        executeTests({
          specs: dependantTests,
          testRailSuiteId,
          generalTestRailId,
          retryOnAssertionFail,
          specPath,
          isDependant: true,
          parentSpecName: spec.name,
        });
      }
    });
}

function runPrePostConditions(
  prePostCondition: () => unknown | Promise<unknown>,
  mochaConditionRunner: HookFunction,
  params: runPrePostConditionsInterface,
) {
  const {ignoreError = false, passExceptionToTests} = params;
  if (!prePostCondition) {
    return;
  }
  mochaConditionRunner(async () => {
    try {
      await prePostCondition();
    } catch (err) {
      if (ignoreError) {
        console.warn(`Ignoring error: ${err}`);
      } else {
        if (passExceptionToTests) {
          preconditionException = err;
        } else {
          throw err;
        }
      }
    }
  });
}

function isDisabled(disable) {
  if (!disable) {
    return false;
  }
  if (!disable.env) {
    return true;
  }
  return disable.env === getEnv();
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

function getEnv(): string {
  return 'staging';
}

function getBrowserName(): string {
  return 'chrome';
}



interface dependantTestInterface {
  repeat?: number;
  name: string;
  xname?: string;
  fname?: string;
  test: () => Promise<void>;
  afterTest?: () => Promise<void>;
  disable?: disableInterface;
  testRailId?: number;
  retryOnAssertionFail?: boolean;
}


export interface testInterface extends dependantTestInterface {
  dependantTests?: dependantTestInterface[];
}


interface suiteInterface {
  name: string[];
  testRailSuiteId?: number;
  users?: () => Promise<userInterface[]>;
  beforeAllSpecs?: () => Promise<unknown> | unknown;
  beforeEachSpec?: () => Promise<unknown> | unknown;
  afterEachSpec?: () => Promise<unknown> | unknown;
  afterAllSpecs?: () => Promise<unknown> | unknown;
  specs: testInterface[];
  testRailId?: number;
  retryOnAssertionFail?: boolean;
  addBrowserName?: boolean;
}


export interface disableInterface {
  reason: string;
  link?: string;
  env?: string;
}


interface retryDataInterface {
  specFilePath?: string;
  specs?: testInterface[];
}


interface runPrePostConditionsInterface extends retryDataInterface {
  ignoreError?: boolean;
  passExceptionToTests?: boolean;
}


interface usersHandlerInterface extends retryDataInterface {
  getUsers: () => Promise<userInterface[]>;
}


interface getSpecsToExecuteInterface {
  specs: testInterface[];
  specPath: string;
}


interface executeTestInterface {
  spec: testInterface;
  testRailSuiteId: number;
  generalTestRailId: number;
  suiteRetryOnAssertionFail: boolean;
  isDependant?: boolean;
  parentSpecName?: string;
}


interface executeTestsInterface {
  specs: testInterface[],
  testRailSuiteId: number;
  generalTestRailId: number;
  retryOnAssertionFail: boolean;
  specPath: string;
  isDependant?: boolean;
  parentSpecName?: string;
}
