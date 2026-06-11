import type { ReactNode } from 'react'

import { Span } from '@/rn/components/text'
import { LinkUntyped } from '@/rn/core/components/link-untyped'
import { View } from '@/rn/core/components/view'

type NavSidebarLinkProps = {
  href: string
  label: string
  icon?: ReactNode
  active?: boolean
}

export const NavSidebarLink = ({
  href,
  label,
  icon,
  active,
}: NavSidebarLinkProps) => (
  <LinkUntyped pathname={href}>
    <View
      className={[
        'h-10 flex-row items-center gap-3 rounded-md px-3 transition',
        active
          ? 'bg-primary-50 dark:bg-primary-950'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700',
      ]}
    >
      {icon && (
        <View className='h-5 w-5 items-center justify-center'>{icon}</View>
      )}
      <Span
        className={[
          'text-sm transition',
          active
            ? 'text-primary font-medium'
            : 'text-gray-700 dark:text-gray-300',
        ]}
      >
        {label}
      </Span>
    </View>
  </LinkUntyped>
)
