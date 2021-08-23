import _ from 'lodash';


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

      executeTests({specs, specPath: this.file});
    }))();
  });
}

function executeTests(params: executeTestsInterface) {
  const {specs} = params;
  specs.forEach(spec => {
    executeTest({spec});
  });
}

function executeTest(params: executeTestInterface) {
  const {spec} = params;
  const {name, test, repeat = 1} = spec;
  repeat > 1 && console.warn(`Dont forget to remove "REPEAT"`);
  _.times(repeat, () => it(name, async function() {
    await test();
  }));
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
}


interface testInterface {
  name: string;
  repeat?: number;
  test: () => Promise<void>;
}


interface executeTestsInterface {
  specs: testInterface[],
  specPath: string;
}


interface executeTestInterface {
  spec: testInterface;
}
