const { Route, Router } = require('../src/structures/Routing');

describe('Routing', () => {
  it('should return "/" for the route path', () => {
    const mockRoute = new Route({
      method: 'get',
      route: '/',
      run() {}
    });

    expect(mockRoute.route).toBe('/');
  });

  it('should return "get" for the route method', () => {
    const mockRoute = new Route({
      method: 'get',
      route: '/',
      run() {}
    });

    expect(mockRoute.method).toBe('get');
  });

  it('should add the route to the collection', () => {
    const mockRouter = new Router('/');
    mockRouter.addRoute(new Route({
      method: 'get',
      route: '/',
      run() {}
    }));

    expect(mockRouter.routes.empty).toBe(false);
    expect(mockRouter.routes.size).toBe(1);
  });

  it('should return "/abcd" when the router path and the route path is combined', () => {
    const mockRouter = new Router('/');
    const mockRoute = new Route({
      method: 'get',
      route: '/abcd',
      run() {}
    });

    mockRouter.addRoute(mockRoute);
    expect(mockRoute.route).toBe('/abcd');
  });
});