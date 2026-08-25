import type { FC } from 'react'

import type { ClassName } from 'rntwsc/tw/class-name'
import type { ImagePropsWocn } from 'rntwsc/tw/components/without-class-name/image'
import { ImageWocn } from 'rntwsc/tw/components/without-class-name/image'
import { createClassNameComponent } from 'rntwsc/tw/lib/create-class-name-component'

export type ImageProps = ImagePropsWocn & {
  className?: ClassName
}

export const Image: FC<ImageProps> = createClassNameComponent({
  ImageWocn,
})
