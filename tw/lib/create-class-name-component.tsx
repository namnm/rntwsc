import { clsx } from 'rntwsc/tw/clsx'
import { createClassNameComponentOptions } from 'rntwsc/tw/lib/create-class-name-component-options'
import type { StrMap } from 'rntwsc/libs/utility-types'

export type CreateClassNameComponentOptions = {
  extraClassNameKeys?: string[]
}
type Options = StrMap & CreateClassNameComponentOptions

export const createClassNameComponent = (options: Options) => {
  const { extraClassNameKeys, Component, displayName } =
    createClassNameComponentOptions(options)

  const ClassNameComponent = ({ ...props }: any) => {
    props.className = clsx(props.className)
    extraClassNameKeys?.forEach(k => {
      props[k] = clsx(props[k])
    })
    return <Component {...props} />
  }

  ClassNameComponent.displayName = displayName
  return ClassNameComponent
}
