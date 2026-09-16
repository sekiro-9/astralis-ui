import { Button, ButtonGroup, CopyButton, ThemeToggle, Toolbar } from "astralis-ui";
import { buttonProps } from "../button/button-props";
import { buttonGroupProps } from "../button-group/button-group-props";
import { copyButtonProps } from "../copy-button/copy-button-props";
import { themeToggleProps } from "../theme-toggle/theme-toggle-props";
import { toolbarProps } from "../toolbar/toolbar-props";
import { asEntry, definePlaygrounds } from "./define";

export const buttonPlaygrounds = definePlaygrounds({
  "button-demo": {
    tag: "Button",
    component: asEntry(Button),
    rows: buttonProps,
    children: "Button",
    childrenLabel: "Label",
  },
  "button-group-demo": {
    tag: "ButtonGroup",
    component: asEntry(ButtonGroup),
    rows: buttonGroupProps,
    fixture: (
      <>
        <Button>Save draft</Button>
        <Button>Preview</Button>
        <Button>Publish</Button>
      </>
    ),
  },
  /* No `children`: it renders from props alone, so the stage shows it bare and
     codegen self-closes the tag. */
  "theme-toggle-demo": {
    tag: "ThemeToggle",
    component: asEntry(ThemeToggle),
    rows: themeToggleProps,
  },
  "copy-button-demo": {
    tag: "CopyButton",
    component: asEntry(CopyButton),
    rows: copyButtonProps,
    baseProps: { value: "npm install astralis-ui" },
    children: "Copy",
    childrenLabel: "Label",
  },
  "toolbar-demo": {
    tag: "Toolbar",
    component: asEntry(Toolbar),
    rows: toolbarProps,
    baseProps: { label: "Text formatting" },
    fixture: (
      <>
        <Toolbar.Group aria-label="Style">
          <Button size="sm" variant="text" colorScheme="gray">
            Bold
          </Button>
          <Button size="sm" variant="text" colorScheme="gray">
            Italic
          </Button>
        </Toolbar.Group>
        <Toolbar.Separator />
        <Button size="sm" variant="text" colorScheme="gray">
          Link
        </Button>
      </>
    ),
  },
});
