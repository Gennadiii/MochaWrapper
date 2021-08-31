Suite helper is a custom Mocha interface.

Suite solves next problems:

 * Allows to run some afterTest code which will be run even if test had an error
 * Accepts array of names and creates nested "describe" blocks from it. No need for lots of nested "describes" anymore
 * Creates disabled message and link to bug tracker
 * Automatically adds generic names (eg browserName) to first describe block
 * Can repeat certain specs for debug purpose
 * Has force spec syntax to run specific tests and quick skip
 * Manages TestRail id's
 * Tells test retryer about failed tests
 * Dependant tests feature - if one test depends on another and first one fails, dependant one doesn't get executed
 * Easy syntax for allocating and freeing users
 * Doesn't fail on preconditions because ```before``` block doesn't belong to any test and messes the report. Instead, it fails tests with error from preconditions.
 
 ```
 suiteHelper({
  name: [`Suite name`],
  testRailSuiteId: 42,
  testRailId: 18,
  async beforeAllSpecs() {},
  async beforeEachSpec() {},
  async afterEachSpec() {},
  async afterAllSpecs() {},
  // allocates user before all tests in suite and free it after tests
  users: async () => [admin = await service.user.admin()],
  specs: [
    {
      name: `regular spec`,
     testRailId: 23,
      async test() {
        // test
      },
      async afterTest() {
        // after test (will be executed even with error in test)
      }
    },
    {
      xname: `skipped spec (like xit in Jasmine or it.skip in Mocha)`,
      async test() {
        // test
      },
    },
    {
      fname: `forced spec (like fit in Jasmine or it.only in Mocha)`,
      async test() {
        // test
      },
    },
    {
      name: `disabled test`,
      disable: {
        reason: 'some reason',
        link: 'https://bug.tracker?issue42'
      },
      async test() {
        // test
      },
      dependantTests: [
        name: `dependant test`,
        retryOnAssertionFail: true,
        async test() {
          // test
        },
      ],
    },
    {
      name: `repeated test`,
      repeat: 10,
      async test() {
        // test
      },
    },
  ]
});
```
