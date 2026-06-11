import type { LinkComponent } from '@/rn/core/components/link-untyped'
import { LinkUntyped } from '@/rn/core/components/link-untyped'
import type { Routes, RoutesData } from '#/pages/routes'

export const Link = LinkUntyped as LinkComponent<Routes, RoutesData>
