Native retryer has 2 major problems
* it retries tests failed by assertion
* it retries test right after it failed which is bad in case of server glitch. For instance some BE service died and requires some time to recover. If we retry test in a while the chance of service being healthy again is much bigger

There're other generic solutions in npm but they may only get info about failed files but not tests inside. So if file contains several tests and only one of them failed then every test in that file will be retried.

Our retry solution solves all that problems.

In order to do that we use ```suite.helper``` to collect data about failed tests and filter out good tests for retry. Another part is ```testRunner.tool``` which is an entry point for the tests. It runs in a loop controlled by ```testRetry``` env variable.

We retry only tests with exceptions by default but we also may retry tests failed by assertion using flag ```retryOnAssertionFail``` in ```suite.helper```

While initial test run, ```suite.helper``` creates temp dir and writes data about failed tests to that dir. Each suite to it's own file. We need that because each test runs in it's own process thus we can't communicate between those processes easily. If any test fails by assertion and doesn't have to be retried - special file named ```tetsRunIsFailed``` is written to fs. We will need it later.

The entire test run is controlled by ```testRunner.tool```. If tests fail then we gather all failed info to a single file ```retryData.json``` set special env flag ```isRetry``` to true and start from the beginning. But now instead of running all tests we get paths to failed tests and write them to another env variable ```CISpecNames```. Test runner setup to run tests from this variable if it exists.

So now if retried test run is green then we check for ```tetsRunIsFailed``` file and exit process with either code 1 or 0 depending on that file.

```
interface tempDataInterface {
  filePath: [testName1, testName2];
}
```

```retryData.json``` example:
```
[
  { // test run 1
    failedTestPath1: ['testName1', 'testName2'],
    failedTestPath2: ['testName3'],
  },
  { // test run 2 (retry)
    failedTestPath2: ['testName3'],
  },
]
```

When rerunning a test ```suite.helper``` filters out tests with names which are not in retry data
