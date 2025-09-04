import type { RouteDefinition } from '@solidjs/router';
import { lazy } from 'solid-js';

import AboutData from './pages/about.data';
import Home from './pages/home';
import ReactiveExample from './pages/test';

export const routes: RouteDefinition[] = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/about',
    component: lazy(() => import('./pages/about')),
    data: AboutData,
  },
  {
    path: '/test',
    component: ReactiveExample
  },
  {
    path: '**',
    component: lazy(() => import('./errors/404')),
  },
];
