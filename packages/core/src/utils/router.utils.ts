import { Route, Router } from '@vaadin/router';
import { ref } from 'lit/directives/ref.js';

const router = new Router();

export const getRouter = (): Router => router;

// configure the router asynchronously
export const configureRouter = (routes: Route[], outlet?: Element) => {
  router.setRoutes(routes);
  router.setOutlet(outlet!);
};

// navigates conveniently by notifying the router
export const navigateTo = async (path: string) => {
  // resolve the path to a route
  const route = await router.resolve({ pathname: path });

  // use history to navigate to the route
  window.history.pushState(null, '', route.pathname);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

// convenience function to be used as event handler
export const handleNavigation = (path: string) => () => navigateTo(path);

// can be used to set active classes for navigation links
// e.g. `<a href="/some/route" ${toggleActive('active')}>Link</a>`
export const toggleActive = (className: string): ReturnType<typeof ref> =>
  ref((link?: Element) => {
    const matchPath = (path: string) => {
      const href = link?.getAttribute('href')!;
      link?.classList.toggle(className, path.startsWith(href));
    };
    window.addEventListener('vaadin-router-location-changed', async event => {
      matchPath(event.detail.location.pathname);
    });
    matchPath(location.pathname);
  });
