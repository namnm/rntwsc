# Component development

## Key locations

| What                                 | Where                                              |
| ------------------------------------ | -------------------------------------------------- |
| Framework components                 | packages/core/components/name/index.tsx            |
| Playground pages (shared RN and web) | playground/app/src/pages/name/index.tsx            |
| Web routes                           | playground/turbopack/src/app/locale/name/page.tsx  |
| Route constants                      | playground/app/src/pages/route-paths.ts            |
| RN route map                         | playground/app/src/pages/routes.native.ts          |
| Sidebar nav                          | playground/app/src/components/nav-layout/index.tsx |

## Reference components

Read the closest existing component before building a new one:

| Pattern                                            | File                  |
| -------------------------------------------------- | --------------------- |
| Full complexity (cva, ripple, elevation)           | button/index.tsx      |
| Boolean toggle plus controlled state               | switch/index.tsx      |
| Group context pattern                              | radio/index.tsx       |
| cva with appearance times type                     | badge/index.tsx       |
| Trigger opens a drawer, single or multiple select  | select/index.tsx      |
| Trigger opens a drawer, with custom content inside | date-picker/index.tsx |
| Single or multiple props union                     | accordion/index.tsx   |

All components live under packages/core/components/.

## Adding a component

1. packages/core/components/name/index.tsx - the component
2. playground/app/src/pages/name/index.tsx - demo page, showing all variants
3. playground/app/src/pages/route-paths.ts - export a path constant, for example rFoo equal to '/foo'
4. playground/app/src/pages/routes.native.ts - import the page and add it to routesNative
5. playground/turbopack/src/app/locale/name/page.tsx - re-export the page as the route's default export
6. playground/app/src/components/nav-layout/index.tsx - add a NavSidebarLink pointing at the new route

When editing a component, update the playground demo if the API changed.

## cva conventions

Never hardcode Tailwind strings inline in JSX. Every class name goes in classNames (base) or in an attribute's or compoundVariant's own classNames.

Standard attribute set for form-like components: appearance, size, shape, disabled, active, invalid.

The active attribute marks the open or focused state (drawer open, input focused). Mirror TextInput's focus border styles via compound variants.

The invalid attribute marks the error state. Use compound variants per appearance, for example border-error for a bordered appearance or border-b-error for an underlined one.

Put invalid compound variants after active ones, so the error border always wins when both are true.

The underlined appearance always needs rounded-none - add compound variants for underlined times rounded and underlined times pill.

The size attribute only scales the trigger, not the drawer or popover content - put drawer item padding and font size in the base classNames at a fixed size instead.

Compound variant order:

```
1. shape overrides   (underlined forces rounded-none)
2. active state      (open border color)
3. invalid state     (error border color, wins over active)
```

## Trigger to drawer pattern

For components that open a bottom sheet on press (Select, DatePicker):

```tsx
const [open, setOpen] = useState(false)
const cn = fooCva({ ..., active: open })

<Pressable onPress={() => setOpen(true)} className={cn.trigger}>
  ...
</Pressable>

<Drawer value={open} onChange={setOpen} contentContainerClassName='pb-8'>
  ...
</Drawer>
```

Drawer content size is fixed - it is not scaled by the trigger's size prop.

In multiple select mode only, render a Done button inside the drawer. Do not close the drawer on each item tap.

## Single or multiple props pattern

```tsx
export type FooProps = (SingleProps | MultipleProps) & BaseProps

const [state, setState] = useControllableState<string | string[]>({
  value: value as any,
  defaultValue: defaultValue ?? (multiple ? [] : ''),
  onChange: onChange as any,
})
```

The as any casts are correct here - the same pattern is used in accordion/index.tsx.

## SVG icons

Icons live in packages/core/svg-icons/. className controls both color (the current text color becomes the fill) and size (the current text size becomes width and height). Use dedicated directional icons (chevron-left, chevron-bottom, and so on) instead of rotating chevron-right.
