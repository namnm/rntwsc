# Assets

## Image

`Image` is aliased to `react-native-fast-image` on native and a plain `<img>` on web. Use Tailwind `object-*` classes for resize mode. Optimization (srcset, ratio, etc.) is handled at the API/backend level - pass the result via `src` and class names.

## SVG

Import SVGs directly as React components (via svgr loader). Rendered width = font size, height = line height. Set `currentColor` in the SVG for color inheritance.

```tsx
import StarIcon from '#/svg-icons/star.svg'

// className controls color (text-* -> fill) and size (text-* -> width/height)
;<StarIcon className='text-xl text-yellow-500' />
```

The `style` prop is ignored on web - always use `className`.

## HTML semantics and accessibility

Standard RN props (`accessibilityRole`, `aria-*`) are supported. Use `rnwTag` to override the rendered HTML tag for base components on web.
