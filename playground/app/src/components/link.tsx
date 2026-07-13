import type { LinkComponent } from '@rntwsc/core/tw/components/link-untyped'
import { LinkUntyped } from '@rntwsc/core/tw/components/link-untyped'

import type { Routes, RoutesData } from '#/pages/routes'

export const Link = LinkUntyped as LinkComponent<Routes, RoutesData>
