import type { FC } from 'react'

import type { ClassName } from '@/core/tw/class-name'
import type { ImagePropsWocn } from '@/core/tw/components/without-class-name/image'
import { ImageWocn } from '@/core/tw/components/without-class-name/image'
import { createClassNameComponent } from '@/core/tw/lib/create-class-name-component'

export type ImageProps = ImagePropsWocn & {
  className?: ClassName
}

export const Image: FC<ImageProps> = createClassNameComponent({
  ImageWocn,
})
