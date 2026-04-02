import type { RouteComponent } from 'vue-router';
import type { CustomRoute, ElegantConstRoute, ElegantRoute } from '@elegant-router/types';
import { generatedRoutes } from '../elegant/routes';
import { layouts, views } from '../elegant/imports';
import { transformElegantRoutesToVueRoutes } from '../elegant/transform';

/**
 * custom routes
 *
 * @link https://github.com/soybeanjs/elegant-router?tab=readme-ov-file#custom-route
 */
const customViews: Record<string, RouteComponent | (() => Promise<RouteComponent>)> = {
  'dev-table-column-state': () => import('@/test-pages/table-column-state/index.vue')
};

const customRoutes: CustomRoute[] =
  import.meta.env.MODE === 'test'
    ? [
        {
          name: 'dev-table-column-state',
          path: '/__test/table-column-state',
          component: 'layout.blank$view.dev-table-column-state',
          meta: {
            title: 'Table Column State Test',
            constant: true,
            hideInMenu: true
          }
        } as unknown as CustomRoute
      ]
    : [];

/** create routes when the auth route mode is static */
export function createStaticRoutes() {
  const constantRoutes: ElegantRoute[] = [];

  const authRoutes: ElegantRoute[] = [];

  [...customRoutes, ...generatedRoutes].forEach(item => {
    if (item.meta?.constant) {
      constantRoutes.push(item);
    } else {
      authRoutes.push(item);
    }
  });

  return {
    constantRoutes,
    authRoutes
  };
}

/**
 * Get auth vue routes
 *
 * @param routes Elegant routes
 */
export function getAuthVueRoutes(routes: ElegantConstRoute[]) {
  const appViews = {
    ...views,
    ...customViews
  };

  return transformElegantRoutesToVueRoutes(routes, layouts, appViews);
}
