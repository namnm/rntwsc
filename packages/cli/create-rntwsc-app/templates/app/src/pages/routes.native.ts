import { HomePage } from '#/pages/home'
import { rHome } from '#/pages/route-paths'

// we define all routes for native
// need to explicit define it here to make sure not
// accidentally import all routes into web bundle
export const routesNative = {
  [rHome]: HomePage,
}
export type Routes = typeof routesNative
