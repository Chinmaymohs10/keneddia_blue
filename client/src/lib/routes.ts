/**
 * Route Registry
 * Centralized list of all available routes in the application
 */

export const availableRoutes = [
  '/',
  '/hotels',
  '/cafes',
  '/bars',
  '/about',
  '/events',
  '/entertainment',
  '/reviews',
  '/login',
  '/news',
  '/careers',
] as const;

export type AvailableRoute = typeof availableRoutes[number];

/**
 * Check if a route is available
 */
export function isRouteAvailable(route: string): boolean {
  return availableRoutes.includes(route as AvailableRoute);
}

/**
 * Get disabled link props for unavailable routes
 */
export function getDisabledLinkProps(route: string) {
  if (!isRouteAvailable(route)) {
    return {
      className: 'pointer-events-none opacity-50 cursor-not-allowed',
      'aria-disabled': true,
      onClick: (e: React.MouseEvent) => e.preventDefault(),
    };
  }
  return {};
}
