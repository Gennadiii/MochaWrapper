export const stringHelper = {

  toBoolean(str: string): boolean {
    switch (str) {
      case 'true':
        return true;
      case 'false':
      case undefined:
        return false;
      case '':
        return false;
      default:
        throw new Error(`wrong string: ${str}`);
    }
  },
};
