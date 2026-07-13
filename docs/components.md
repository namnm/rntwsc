# Components

Built-in React Native components, styled with Tailwind class names (see tailwind.md), working across server, browser, and native. Import each one from its own path, for example:

```tsx
import { Button } from '@/core/components/button'
import { Switch } from '@/core/components/switch'

const MyForm = () => (
  <>
    <Switch value={enabled} onChange={setEnabled} />
    <Button appearance='primary' size='md' onPress={submit}>
      Submit
    </Button>
  </>
)
```

Most components share a standard attribute set: appearance, size, shape, disabled, active, and invalid. active marks an open or focused state, invalid marks an error state - see contribution/components.md for the full cva conventions if you are adding or changing a component.

## Available components

| Component            | What it is                                                   |
| -------------------- | ------------------------------------------------------------ |
| Accordion            | Single or multiple expand and collapse sections              |
| Alert                | Inline message box with appearance variants                  |
| Badge                | Small status or count label                                  |
| Button               | Full featured pressable: cva variants, ripple, elevation     |
| ButtonGroup          | Groups multiple buttons together, segmented look             |
| ToggleGroup          | Single or multiple selectable toggle buttons                 |
| Checkbox             | Boolean toggle checkbox                                      |
| DatePicker           | Trigger opens a drawer to pick a date                        |
| Drawer               | Bottom sheet primitive, also used by Select and DatePicker   |
| Dropdown             | Contextual popover menu                                      |
| Form, FormField      | react-hook-form integration wrapper                          |
| Modal                | Centered dialog overlay                                      |
| Portal               | Renders children into a root container elsewhere in the tree |
| Radio, RadioGroup    | Single choice selection                                      |
| Select               | Trigger opens a drawer, single or multiple selection         |
| Separator            | Simple dividing line                                         |
| Skeleton             | Loading placeholder block                                    |
| Spinner              | Loading spinner indicator                                    |
| Switch               | Boolean toggle switch                                        |
| Text, H1 to H6, Span | Text and heading components                                  |

A few building blocks are used internally by the components above rather than used directly: Icon's createSvgIcon (see assets.md for svg icons), Ripple's press ripple effect, Slot's polymorphic render-as-child utility, and Inset's inset shadow overlay.

## Demos

Every component has a working demo page under playground/app/src/pages/, shared between the React Native app and both Next.js playgrounds - see contribution/components.md for the exact file layout if you want to add a new one.
