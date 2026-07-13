# Assets

## Image

Image is aliased to react-native-fast-image on native and a plain img element on web. Use Tailwind object- classes for resize mode. Optimization (srcset, ratio, and so on) is handled at the API or backend level - pass the result via src and class names.

## SVG

Import SVGs directly as React components (via the svgr loader). Rendered width equals the font size, rendered height equals the line height. Set currentColor in the SVG for color inheritance.

```tsx
import StarIcon from '#/svg-icons/star.svg'

// className controls color (current text color becomes fill) and size (current text size becomes width and height)
;<StarIcon className='text-xl text-yellow-500' />
```

The style prop is ignored on web - always use className.

See contribution/dev.md for how to add a new icon to packages/core/svg-icons/.

## HTML semantics and accessibility

Standard RN props (accessibilityRole, aria-*) are supported. Use rnwTag to override the rendered HTML tag for base components on web.
