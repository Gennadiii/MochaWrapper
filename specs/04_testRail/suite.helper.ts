export function suite(params: suiteInterface): void {
  const {name, specs, testRailSuiteId} = params;

  const reducedName = [...name];
  const inner = reducedName.pop();

  describe(`${getEnv()}_<-${getBrowserName()}->`, () => {
    reducedName.reduceRight((prev, cur) => {
      return () => describe(cur, () => {
        prev();
      });
    }, () => describe(inner, function() {
      console.info(`Tests "${specs.map(spec => spec.name).join(', ')}" running on pid: ${process.pid}`);

      executeTests({specs, testRailSuiteId});
    }))();
  });
}

function executeTests(params: executeTestsInterface) {
  const {specs, testRailSuiteId} = params;
  specs.forEach(spec => {
    executeTest({spec, testRailSuiteId});
  });
}

function executeTest(params: executeTestInterface) {
  const {spec, testRailSuiteId} = params;
  const {name, test, testRailId} = spec;
  it(`${name} S${testRailSuiteId} C${testRailId}`, async function() {
    await test();
  });
}


function getEnv(): string {
  return 'staging';
}

function getBrowserName(): string {
  return 'chrome';
}


interface suiteInterface {
  name: string[];
  specs: testInterface[];
  testRailSuiteId?: number;
}


interface testInterface {
  name: string;
  test: () => Promise<void>;
  testRailId?: number;
}


interface executeTestsInterface {
  specs: testInterface[];
  testRailSuiteId: number;
}


interface executeTestInterface {
  spec: testInterface;
  testRailSuiteId: number;
}
