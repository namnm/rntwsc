# Component development

## Key locations

| What                               | Where                                             |
| ---------------------------------- | ------------------------------------------------- |
| Framework components               | `packages/rn/components/<name>/index.tsx`         |
| Playground pages (shared RN + web) | `playground/src/pages/<name>/index.tsx`           |
| Web routes                         | `playground-web/src/app/[locale]/<name>/page.tsx` |
| Route constants                    | `playground/src/pages/route-paths.ts`             |
| RN route map                       | `playground/src/pages/routes.native.ts`           |
| Sidebar nav                        | `playground/src/components/nav-layout/index.tsx`  |

## Reference components

Read the closest existing component before building a new one:

| Pattern                                    | File                    |
| ------------------------------------------ | ----------------------- |
| Full complexity (cva, ripple, elevation)   | `button/index.tsx`      |
| Boolean toggle + controlled state          | `switch/index.tsx`      |
| Group context pattern                      | `radio/index.tsx`       |
| cva with appearance x type                 | `badge/index.tsx`       |
| Trigger -> Drawer (single/multiple select) | `select/index.tsx`      |
| Trigger -> Drawer + custom UI inside       | `date-picker/index.tsx` |
| Single/Multiple props union                | `accordion/index.tsx`   |

All components live under `packages/rn/components/`.

## Adding a component

1. `packages/rn/components/<name>/index.tsx` - component
2. `playground/src/pages/<name>/index.tsx` - demo page, show all variants
3. `playground/src/pages/route-paths.ts` - `export const rFoo = '/foo'`
4. `playground/src/pages/routes.native.ts` - import page + add to `routesNative`
5. `playground-web/src/app/[locale]/<name>/page.tsx` - `export { FooPage as default } from '#/pages/<name>'`
6. `playground/src/components/nav-layout/index.tsx` - `<NavSidebarLink href={rFoo} label='Foo' />`

When editing a component, update the playground demo if the API changed.

## cva conventions

- Never hardcode Tailwind strings inline in JSX. Every class name goes in `classNames` (base) or `attributes`/`compoundVariants`.
- Standard attribute set for form-like components: `appearance`, `size`, `shape`, `disabled`, `active`, `invalid`.
  - `active` = open/focused state (drawer open, input focused). Mirror TextInput `focus:` border styles via compound variants.
  - `invalid` = error state. Use compound variants per appearance (`border-error` / `border-b-error` for underlined).
  - Put `invalid` compound variants after `active` so `border-error` always wins when both are true.
- `underlined` appearance always needs `rounded-none` - add compound variants for `underlined` x `rounded` and `underlined` x `pill`.
- `size` only scales the trigger, not drawer/popover content - put drawer item padding/font in base `classNames` at a fixed size.

Compound variant order:

```
1. shape overrides  (underlined -> rounded-none)
2. active state     (open border color)
3. invalid state    (error border color, wins over active)
```

## Trigger -> Drawer pattern

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

- Drawer content size is fixed - not scaled by the trigger's `size` prop.
- In multiple-select mode only, render a Done button inside the drawer. Do not close on each item tap.

## Single/Multiple props pattern

```tsx
export type FooProps = (SingleProps | MultipleProps) & BaseProps

const [state, setState] = useControllableState<string | string[]>({
  value: value as any,
  defaultValue: defaultValue ?? (multiple ? [] : ''),
  onChange: onChange as any,
})
```

The `as any` casts are correct here - same pattern used in `accordion/index.tsx`.

## SVG icons

Icons live in `packages/rn/svg-icons/`. `className` controls color (`text-*` -> fill) and size (`text-*` -> width/height). Use dedicated directional icons (`chevron-left`, `chevron-bottom`, etc.) - do not rotate `chevron-right`.
