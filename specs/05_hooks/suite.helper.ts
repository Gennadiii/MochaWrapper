import HookFunction = Mocha.HookFunction;


let preconditionException = null;

export function suite(params: suiteInterface): void {
  const {name, specs, beforeAllSpecs, afterAllSpecs, afterEachSpec, beforeEachSpec, users} = params;

  const reducedName = [...name];
  const inner = reducedName.pop();

  describe(`${getEnv()}_<-${getBrowserName()}->`, () => {
    reducedName.reduceRight((prev, cur) => {
      return () => describe(cur, () => {
        prev();
      });
    }, () => describe(inner, function() {
      console.info(`Tests "${specs.map(spec => spec.name).join(', ')}" running on pid: ${process.pid}`);

      users && usersHandler({getUsers: users});

      runPrePostConditions(beforeAllSpecs, before, {passExceptionToTests: true});
      runPrePostConditions(beforeEachSpec, beforeEach, {passExceptionToTests: true});
      runPrePostConditions(afterEachSpec, afterEach);
      runPrePostConditions(afterAllSpecs, after, {ignoreError: true});

      executeTests({specs});
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
  const {name, test, afterTest} = spec;
  it(name, async function() {
    if (preconditionException) {
      throw new Error(`'before(all/each)' failed: ${preconditionException}`);
    }
    try {
      await test();
    } finally {
      if (afterTest) {
        console.debug(`Running afterTest`);
        await afterTest();
      }
    }
  });
}


function getEnv(): string {
  return 'staging';
}

function getBrowserName(): string {
  return 'chrome';
}

function runPrePostConditions(
  prePostCondition: () => unknown | Promise<unknown>,
  mochaConditionRunner: HookFunction,
  params: runPrePostConditionsInterface = {},
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

function usersHandler(params: usersHandlerInterface) {
  const {getUsers} = params;
  let users: userInterface[];
  runPrePostConditions(
    () => users = getUsers(),
    before, {passExceptionToTests: true});
  runPrePostConditions(
    () => users && users.map(user => user.free()),
    after,
    {ignoreError: true});
}


interface usersHandlerInterface {
  getUsers: () => userInterface[];
}


export interface userInterface {
  id: string;
  name: string;
  free: () => void;
}


interface suiteInterface {
  name: string[];
  specs: testInterface[];
  users?: () => userInterface[];
  beforeAllSpecs?: () => Promise<unknown> | unknown;
  beforeEachSpec?: () => Promise<unknown> | unknown;
  afterEachSpec?: () => Promise<unknown> | unknown;
  afterAllSpecs?: () => Promise<unknown> | unknown;
}


interface testInterface {
  name: string;
  test: () => Promise<void>;
  afterTest?: () => Promise<void>;
}


interface executeTestsInterface {
  specs: testInterface[];
}


interface executeTestInterface {
  spec: testInterface;
}


interface runPrePostConditionsInterface {
  ignoreError?: boolean;
  passExceptionToTests?: boolean;
}
