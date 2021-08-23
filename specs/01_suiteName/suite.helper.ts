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

      specs.forEach(spec => it(spec.name, async function() {
        await spec.test();
      }));
    }))();
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
}


export interface testInterface {
  name: string;
  test: () => Promise<void>;
}
