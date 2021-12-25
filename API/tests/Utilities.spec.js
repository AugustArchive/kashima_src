const utils = require('../src/util');

describe('Utilities', () => {
  it('should return a Gravatar avatar url', () => {
    const avatar = utils.gravatar('ohlookitsaugust@gmail.com');
    expect(avatar).toStrictEqual('https://secure.gravatar.com/avatar/c79151e3f904c0aeec3e0459cb58011b');
  });

  it('should append "test" to the path', () => {
    const cwd = process.cwd();
    const sep = utils.sep;

    expect(utils.getArbitrayPath('test')).toStrictEqual(`${cwd}${sep}test`);
  });
});