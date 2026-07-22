import type { LinkComponent } from 'rntwsc/tw/components/link-untyped'
import { LinkUntyped } from 'rntwsc/tw/components/link-untyped'

import type { Routes, RoutesData } from '#/pages/routes'

export const Link = LinkUntyped as LinkComponent<Routes, RoutesData>
