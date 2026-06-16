import { AccordionPage } from '#/pages/accordion'
import { AlertPage } from '#/pages/alert'
import { BadgePage } from '#/pages/badge'
import { ButtonPage } from '#/pages/button'
import { ButtonGroupPage } from '#/pages/button/button-group'
import { ButtonToggleGroupPage } from '#/pages/button/button-toggle-group'
import { CheckboxPage } from '#/pages/checkbox'
import { DatePickerPage } from '#/pages/date-picker'
import { DrawerPage } from '#/pages/drawer'
import { FetchPage } from '#/pages/fetch'
import { FormPage } from '#/pages/form'
import { GraphQLPage } from '#/pages/graphql'
import { GridPage } from '#/pages/grid'
import { HomePage } from '#/pages/home'
import { ModalPage } from '#/pages/modal'
import { NativeRefsPage } from '#/pages/native-refs'
import { RadioPage } from '#/pages/radio'
import {
  rAccordion,
  rAlert,
  rBadge,
  rButton,
  rButtonGroup,
  rButtonToggleGroup,
  rCheckbox,
  rDatePicker,
  rDrawer,
  rFetch,
  rForm,
  rGraphQL,
  rGrid,
  rHome,
  rModal,
  rNativeRefs,
  rRadio,
  rRuntime,
  rSelect,
  rSwitch,
  rTextInput,
  rViewport,
} from '#/pages/route-paths'
import { RuntimePage } from '#/pages/runtime'
import { SelectPage } from '#/pages/select'
import { SwitchPage } from '#/pages/switch'
import { TextInputPage } from '#/pages/text-input'
import { ViewportPage } from '#/pages/viewport'

// we define all routes for native
// need to explicit define it here to make sure not
// accidentally import all routes into web bundle
export const routesNative = {
  [rHome]: HomePage,
  [rFetch]: FetchPage,
  [rGraphQL]: GraphQLPage,
  [rAccordion]: AccordionPage,
  [rBadge]: BadgePage,
  [rButton]: ButtonPage,
  [rButtonGroup]: ButtonGroupPage,
  [rButtonToggleGroup]: ButtonToggleGroupPage,
  [rAlert]: AlertPage,
  [rTextInput]: TextInputPage,
  [rSwitch]: SwitchPage,
  [rCheckbox]: CheckboxPage,
  [rRadio]: RadioPage,
  [rDatePicker]: DatePickerPage,
  [rDrawer]: DrawerPage,
  [rModal]: ModalPage,
  [rForm]: FormPage,
  [rSelect]: SelectPage,
  [rGrid]: GridPage,
  [rNativeRefs]: NativeRefsPage,
  [rRuntime]: RuntimePage,
  [rViewport]: ViewportPage,
}
export type Routes = typeof routesNative
