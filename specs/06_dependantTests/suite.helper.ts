let specException = null;

export function suite(params: suiteInterface): void {
  const {
    name,
    specs,
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

      executeTests({specs});
    }))();
  });
}


function executeTest(params: executeTestInterface) {
  const {isDependant, spec} = params;
  const {
    name: specName,
    test,
  } = spec;
  let {disable} = spec;
  if (!isDisabled(disable)) {
    disable = null;
  }
  if (!isDependant) {
    specException = null;
  }
  const testName = `- ${specName}${
    disable ? ` #${disable && disable.reason}` : ''}`;

  const testFunc = disable ? it.skip : it;

  testFunc(testName, async function() {
    try {
      if (isDependant && specException) {
        throw new Error(`Precondition failed: ${specException}`);
      }
      await test();
      specException = null;
    } catch (err) {
      if (!isDependant) {
        specException = err;
      }
      throw err;
    }
  })
}

function executeTests(params: executeTestsInterface) {
  const {specs, isDependant} = params;
  specs
    .forEach(spec => {
      const {dependantTests} = spec;
      executeTest({spec, isDependant});
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
          isDependant: true,
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

function isDisabled(disable) {
  if (!disable) {
    return false;
  }
  if (!disable.env) {
    return true;
  }
  return disable.env === getEnv();
}


interface dependantTestInterface {
  name: string;
  test: () => Promise<void>;
  disable?: disableInterface;
}


export interface testInterface extends dependantTestInterface {
  dependantTests?: dependantTestInterface[];
}


interface suiteInterface {
  name: string[];
  specs: testInterface[];
}


export interface disableInterface {
  reason: string;
  link?: string;
  env?: string;
}


interface executeTestInterface {
  spec: testInterface;
  isDependant?: boolean;
}


interface executeTestsInterface {
  specs: testInterface[],
  isDependant?: boolean;
}
