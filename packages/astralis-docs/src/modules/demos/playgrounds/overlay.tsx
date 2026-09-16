import {
  AlertDialog,
  Backdrop,
  Button,
  Center,
  ContextMenu,
  Drawer,
  HoverCard,
  Link,
  Menu,
  Modal,
  Popover,
  Spinner,
  Text,
  Tooltip,
} from "astralis-ui";
import { alertDialogProps } from "../alert-dialog/alert-dialog-props";
import { backdropProps } from "../backdrop/backdrop-props";
import { contextMenuProps } from "../context-menu/context-menu-props";
import { drawerProps } from "../drawer/drawer-props";
import { hoverCardProps } from "../hover-card/hover-card-props";
import { menuProps } from "../menu/menu-props";
import { modalProps } from "../modal/modal-props";
import { popoverProps } from "../popover/popover-props";
import { tooltipProps } from "../tooltip/tooltip-props";
import { asEntry, definePlaygrounds } from "./define";

/* Overlays have no closed-state appearance beyond their trigger, so the canvas
   shows the trigger and you open it to see the props take effect. That is also
   what the component looks like on a real page, so nothing is being faked.
   Modal and Drawer cover the viewport when open, which is their nature rather
   than a playground problem. */

export const overlayPlaygrounds = definePlaygrounds({
  "modal-demo": {
    tag: "Modal",
    component: asEntry(Modal),
    rows: modalProps,
    fixture: (
      <>
        <Modal.Trigger>
          <Button variant="outline" colorScheme="gray">
            Open modal
          </Button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>Edit profile</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body>
            <Modal.Description>Change your details and save.</Modal.Description>
          </Modal.Body>
        </Modal.Content>
      </>
    ),
  },
  "drawer-demo": {
    tag: "Drawer",
    component: asEntry(Drawer),
    rows: drawerProps,
    fixture: (
      <>
        <Drawer.Trigger>
          <Button variant="outline" colorScheme="gray">
            Open settings
          </Button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Workspace settings</Drawer.Title>
            <Drawer.CloseButton />
          </Drawer.Header>
          <Drawer.Body>
            <Drawer.Description>Slides in from the placement you pick.</Drawer.Description>
          </Drawer.Body>
        </Drawer.Content>
      </>
    ),
  },
  "popover-demo": {
    tag: "Popover",
    component: asEntry(Popover),
    rows: popoverProps,
    fixture: (
      <>
        <Popover.Trigger>
          <Button variant="outline" colorScheme="gray">
            Share
          </Button>
        </Popover.Trigger>
        <Popover.Content withArrow>
          <Popover.Title>Share this page</Popover.Title>
          <Popover.Description>Anyone with the link can view.</Popover.Description>
        </Popover.Content>
      </>
    ),
  },
  "tooltip-demo": {
    tag: "Tooltip",
    component: asEntry(Tooltip),
    rows: tooltipProps,
    fixture: (
      <>
        <Tooltip.Trigger>
          <Button variant="outline" colorScheme="gray">
            Hover me
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content withArrow>Auto-format the document</Tooltip.Content>
      </>
    ),
  },
  "menu-demo": {
    tag: "Menu",
    component: asEntry(Menu),
    rows: menuProps,
    fixture: (
      <>
        <Menu.Trigger>
          <Button variant="outline" colorScheme="gray">
            Actions
          </Button>
        </Menu.Trigger>
        <Menu.Content>
          <Menu.Item>Edit</Menu.Item>
          <Menu.Item>Duplicate</Menu.Item>
          <Menu.Separator />
          <Menu.Item>Delete</Menu.Item>
        </Menu.Content>
      </>
    ),
  },
  "alert-dialog-demo": {
    tag: "AlertDialog",
    component: asEntry(AlertDialog),
    rows: alertDialogProps,
    fixture: (
      <>
        <AlertDialog.Trigger>
          <Button colorScheme="error" variant="outline">
            Delete workspace
          </Button>
        </AlertDialog.Trigger>
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>Delete this workspace?</AlertDialog.Title>
            <AlertDialog.Description>This action cannot be undone.</AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Close>
              <Button variant="outline" colorScheme="gray">
                Cancel
              </Button>
            </AlertDialog.Close>
            <AlertDialog.Close>
              <Button colorScheme="error">Delete</Button>
            </AlertDialog.Close>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </>
    ),
  },
  "hover-card-demo": {
    tag: "HoverCard",
    component: asEntry(HoverCard),
    rows: hoverCardProps,
    fixture: (
      <>
        <HoverCard.Trigger>
          <Link href="#astralis">@astralis</Link>
        </HoverCard.Trigger>
        <HoverCard.Content>
          <Text size="sm" weight="semibold">
            Astralis UI
          </Text>
          <Text size="xs" color="muted">
            React 19 components on semantic design tokens.
          </Text>
        </HoverCard.Content>
      </>
    ),
  },
  "context-menu-demo": {
    tag: "ContextMenu",
    component: asEntry(ContextMenu),
    rows: contextMenuProps,
    fixture: (
      <>
        <ContextMenu.Trigger>
          <Center h="24" rounded="lg" border="normal" borderStyle="dashed" borderColor="base" tabIndex={0}>
            <Text size="sm" color="muted">
              Right-click here
            </Text>
          </Center>
        </ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item>Copy</ContextMenu.Item>
          <ContextMenu.Item>Paste</ContextMenu.Item>
          <ContextMenu.Separator />
          <ContextMenu.Item danger>Delete</ContextMenu.Item>
        </ContextMenu.Content>
      </>
    ),
  },
  /* The scrim is fixed to the viewport by design. Scoped with position
     absolute, it covers the canvas instead of the whole docs page. */
  "backdrop-demo": {
    tag: "Backdrop",
    component: asEntry(Backdrop),
    rows: backdropProps,
    baseProps: { style: { position: "absolute" } },
    fixture: <Spinner colorScheme="gray" />,
  },
});
