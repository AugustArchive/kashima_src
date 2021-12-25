const { Route } = require('../src/structures/Routing');

describe('Routing Requirements', () => {
  it('should return a boolean value for "requirements.auth"', () => {
    const mockRoute = new Route({
      requirements: {
        auth: true
      },
      method: 'get',
      route: '/',
      run() {}
    });

    expect(mockRoute.requirements).toBeDefined();
    expect(mockRoute.requirements.auth).toBeTruthy();
  });

  it('should return a length of 1 query', () => {
    const mockRoute = new Route({
      requirements: {
        queries: [
          {
            name: 'abcd',
            required: true
          }
        ]
      },
      method: 'get',
      route: '/',
      run() {}
    });

    expect(mockRoute.requirements.queries).toHaveLength(1);
    expect(mockRoute.requirements.queries[0].required).toBeTruthy();
  });
});