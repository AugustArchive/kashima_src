const { Permissions } = require('../src/util/Constants');
const Permission = require('../src/util/Permissions');

describe('Permissions', () => {
  it('should return true if we have the "publish" permission', () => {
    const util = new Permission(Permissions.publish);
    expect(util.has('publish')).toBe(true);
  });

  it('should return false if we don\'t have the "editNews" permission', () => {
    const util = new Permission(0, Permissions.editNews);
    expect(util.has('editNews')).toBe(false);
  });
});