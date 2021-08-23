import allureReporter from "@wdio/allure-reporter";


export function suite(params: suiteInterface): void {
  const {name, specs} = params;

  const reducedName = [...name];
  const inner = reducedName.pop();

  describe(`${getEnv()}_<-${getBrowserName()}->`, () => {
    reducedName.reduceRight((prev, cur) => {
      return () => describe(cur, () => {
        prev();
      });
    }, () => describe(inner, function() {
      console.info(`Tests "${specs.map(spec => spec.name).join(', ')}" running on pid: ${process.pid}`);

      executeTests({specs});
    }))();
  });
}

function executeTests(params: executeTestsInterface) {
  const {specs} = params;
  getSpecsToExecute({specs})
    .forEach(spec => {
      executeTest({spec});
    });
}

function getSpecsToExecute(params: getSpecsToExecuteInterface): testInterface[] {
  const {specs} = params;
  const forcedTest = specs.find(spec => spec.fname);
  if (forcedTest) {
    forcedTest.name = forcedTest.fname;
    return [forcedTest];
  }
  return specs
    .map(spec => {
      if (spec.xname) {
        spec.name = spec.xname;
        spec.disable = {reason: `No reason :(`};
      }
      return spec;
    });
}

function executeTest(params: executeTestInterface) {
  const {spec} = params;
  const {
    name: specName,
    test,
  } = spec;
  let {disable} = spec;
  if (!isDisabled(disable)) { // checking for env to be disabled
    disable = null;
  }
  const testName = `- ${specName}${
    disable ? ` #${disable && disable.reason}` : ''}`; // adding disable reason to test name

  const testFunc = disable ? it.skip : it;

  testFunc(testName, async function() {
    disable?.link && allureReporter.addIssue(disable.link);
    await test();
  });
}


function getEnv(): string {
  return 'staging';
}

function getBrowserName(): string {
  return 'chrome';
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


interface suiteInterface {
  name: string[];
  specs: testInterface[];
}


interface testInterface {
  name: string;
  xname?: string;
  fname?: string;
  test: () => Promise<void>;
  disable?: disableInterface;
}


interface disableInterface {
  reason: string;
  link?: string;
  env?: string;
}


interface executeTestsInterface {
  specs: testInterface[],
}


interface getSpecsToExecuteInterface {
  specs: testInterface[];
}


interface executeTestInterface {
  spec: testInterface;
}
