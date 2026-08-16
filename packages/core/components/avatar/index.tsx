'use client'

import type { FC, PropsWithChildren } from 'react'
import { createContext, useState } from 'react'

import { Span } from '#/core/components/text'
import type { ClassName } from '#/core/tw/class-name'
import type { ImageProps } from '#/core/tw/components/image'
import { Image } from '#/core/tw/components/image'
import type { ViewProps } from '#/core/tw/components/view'
import { View } from '#/core/tw/components/view'
import type { Variant } from '#/core/tw/cva'
import { cva } from '#/core/tw/cva'
import { useSafeContext } from '#/libs/hooks'

// ---------------------------------------------
// context
// ---------------------------------------------

type Status = 'idle' | 'loaded' | 'error'

type AvatarContextType = {
  cn: ReturnType<typeof avatarCva>
  status: Status
  setStatus: (status: Status) => void
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined)
const useAvatarContext = () => useSafeContext(AvatarContext)

// ---------------------------------------------
// cva
// ---------------------------------------------

const avatarCva = cva({
  classNames: {
    container:
      'relative items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-700',
    image: 'absolute inset-0 h-full w-full',
    fallback: 'absolute inset-0 items-center justify-center',
    fallbackText: 'font-medium text-gray-500 dark:text-gray-400',
  },
  attributes: {
    size: {
      xs: {
        container: 'h-6 w-6',
        fallbackText: 'text-[10px]',
      },
      sm: {
        container: 'h-8 w-8',
        fallbackText: 'text-xs',
      },
      md: {
        container: 'h-10 w-10',
        fallbackText: 'text-sm',
      },
      lg: {
        container: 'h-12 w-12',
        fallbackText: 'text-md',
      },
      xl: {
        container: 'h-16 w-16',
        fallbackText: 'text-lg',
      },
    },
    shape: {
      circle: {
        container: 'rounded-full',
      },
      rounded: {
        container: 'rounded-md',
      },
      square: {
        container: 'rounded-none',
      },
    },
  },
})

// ---------------------------------------------
// Root
// ---------------------------------------------

export type AvatarProps = ViewProps & Variant<typeof avatarCva>

const Root = ({
  size = 'md',
  shape = 'circle',
  className,
  children,
  ...props
}: AvatarProps) => {
  const [status, setStatus] = useState<Status>('idle')
  const cn = avatarCva({
    size,
    shape,
  })

  return (
    <View {...props} className={[cn.container, className]}>
      <AvatarContext.Provider
        value={{
          cn,
          status,
          setStatus,
        }}
      >
        {children}
      </AvatarContext.Provider>
    </View>
  )
}

// ---------------------------------------------
// Image
// ---------------------------------------------

// onLoad/onError pass through to the underlying img/FastImage element but
// aren't in ImagePropsWocn's typed surface, so widen the component type here.
type ImageEventProps = ImageProps & {
  onLoad?: () => void
  onError?: () => void
}
const ImageWithEvents = Image as FC<ImageEventProps>

export type AvatarImageProps = ImageProps

const AvatarImage = ({ className, ...props }: AvatarImageProps) => {
  const { cn, status, setStatus } = useAvatarContext()

  if (status === 'error') {
    return null
  }

  return (
    <ImageWithEvents
      {...props}
      className={[cn.image, className]}
      onLoad={() => setStatus('loaded')}
      onError={() => setStatus('error')}
    />
  )
}

// ---------------------------------------------
// Fallback
// ---------------------------------------------

export type AvatarFallbackProps = PropsWithChildren<{
  className?: ClassName
}>

const Fallback = ({ className, children }: AvatarFallbackProps) => {
  const { cn, status } = useAvatarContext()

  if (status === 'loaded') {
    return null
  }

  return (
    <View className={[cn.fallback, className]}>
      <Span className={cn.fallbackText}>{children}</Span>
    </View>
  )
}

// ---------------------------------------------
// export
// ---------------------------------------------

export const Avatar = Object.assign(Root, {
  Image: AvatarImage,
  Fallback,
})
