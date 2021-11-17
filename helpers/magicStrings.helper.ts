export const magicStrings = {
  path: {
    root: __dirname.replace(/dist.*/, ''),
    get retry(): string {
      return `${this.root}/dist/retryData.json`;
    },
    get retryTempDir(): string {
      return `${this.root}/dist/testRetryData`;
    },
    get testRunIsFailed(): string {
      return `${this.root}/dist/testRunIsFailed`;
    },
  },
  env: {
    qa: 'qa',
    staging: 'staging',
  },
};
