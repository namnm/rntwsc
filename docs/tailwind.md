<!-- START doctoc -->

- [Tailwind](#tailwind)
  - [Core usage](#core-usage)
  - [Extras: transitions (Reanimated)](#extras-transitions-reanimated)
  - [Extras: animations (Reanimated)](#extras-animations-reanimated)
  - [Extras: grid (computed layout, View only)](#extras-grid-computed-layout-view-only)
  - [Extras: other](#extras-other)
  - [Special props](#special-props)
  - [Selectors](#selectors)
  - [Minify](#minify)
  - [cva convention](#cva-convention)

<!-- END doctoc -->

# Tailwind

All class strings are compiled to style objects at build time by a Babel plugin. Unsupported class names are caught at compile time.

## Core usage

```tsx
// jsx className -> style object, hoisted to root scope
const MyComponent = () => <View className='flex flex-col transition' />

// array form - mix static strings, conditions, and forwarded className
const MyComponent = ({ withTransition, className, ...props }: Props) => (
  <View
    {...props}
    className={['flex flex-col', withTransition && 'transition', className]}
  />
)

// tw tagged template - compile class names into a style variable
const style = tw`flex flex-col transition`

// cva - all class names inside are compiled
const button = cva({
  classNames: { root: 'px-4', label: 'font-medium' },
  attributes: {
    size: {
      sm: { root: 'h-8', label: 'text-sm' },
      lg: { root: 'h-12', label: 'text-md' },
    },
  },
  compoundVariants: [{ size: 'sm', classNames: { root: 'rounded' } }],
})
type Props = Variant<typeof button>
const MyButton = (props: Props) => {
  const cn = button(props)
  return (
    <Pressable className={cn.root}>
      <Text className={cn.label} />
    </Pressable>
  )
}

// clsx - all string literals inside are compiled
const composed = clsx(
  'flex flex-col',
  withTransition && 'transition',
  className,
)

// runtime conversion - not recommended, bypasses the compiler and postcss-rename
const style = runtimeStyle('flex flex-col')
```

The `tw` tagged template itself (packages/core/tw/tw.ts) only runs when babel-plugin-tw's build-time transform is skipped, such as in unit tests - in a real build every `` tw`...` `` call is replaced with its extracted class-name string instead. The fallback implementation just joins the template's static parts, since the type signature already forbids any interpolation.

## Extras: transitions (Reanimated)

```
transition
transition-all
transition-colors
transition-opacity
transition-shadow
transition-transform
transition-none
transition-[<value>]
duration-<n>
duration-initial
ease-linear
ease-in
ease-out
ease-in-out
ease-initial
delay-<n>
```

Custom easing: add to tailwind.theme.extend in tailwind.config.js and to transitionTimingFunctionMap in normalize-style-config.ts.

## Extras: animations (Reanimated)

```
animate-spin
animate-ping
animate-pulse
animate-bounce
```

Custom animation: add to tailwind.theme.extend and to animationMap in normalize-style-config.ts.

## Extras: grid (computed layout, View only)

```
grid
grid-cols-none
grid-cols-<n>
grid-cols-[..px_..fr]
gap
gap-x
gap-y
```

## Extras: other

- Transforms: translate-, rotate-, scale-
- Viewport: prop-[<n>vw], prop-[<n>vh], prop-screen
- Calc: prop-[calc(<expr>)] - operators plus, minus, times, divide; units px, vw, vh

## Special props

These class names compile to RN props instead of style:

| Class                                            | Prop                 |
| ------------------------------------------------ | -------------------- |
| line-clamp-n or line-clamp-none                  | numberOfLines        |
| select-text or select-none                       | selectable           |
| placeholder-color                                | placeholderTextColor |
| caret-transparent                                | caretHidden          |
| object-contain, cover, fill, none, or scale-down | resizeMode           |

## Selectors

Platform: web:, ios:, android:, native: - stripped at build time if the platform does not match. Web incompatible classes are auto stripped: theme-, web:, web-, hover:, group-hover:, peer-hover:, cursor-

Color scheme: dark:, light:

Screen size: sm:, md:, lg:, xl:, 2xl:

Events: active: (Pressable onPressIn/Out), focus: (TextInput onFocus/Blur)

Props: disabled:, checked: - pass fields to hook options props or childrenProps

Group and peer: group-selector:, group-key-selector:, peer-selector:, peer-key-selector:. Use TwClassNamePeerProvider to isolate peer contexts.

Nested: sel1:sel2:class - deeper nesting wins.

## Minify

On web, class names can be minified with postcss-rename since the Babel plugin captures all references. See playground/turbopack/postcss.config.ts - it emits the minified class name map to playground/app/src/codegen/class-names.min.json.

## cva convention

An attribute is a component characteristic (color, size, shape) - different from a React prop like an event handler.

An attribute value is one value of an attribute, for example red or sm.

A variant is a full combination of all attributes. N attributes with M values each gives N times M variants.

There is no default variant - set defaults in the component's own default props.
