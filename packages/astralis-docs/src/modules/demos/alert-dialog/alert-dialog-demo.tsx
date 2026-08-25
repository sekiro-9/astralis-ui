import { AlertDialog, Button } from "astralis-ui";

export function AlertDialogDemo() {
  return (
    <AlertDialog>
      <AlertDialog.Trigger>
        <Button colorScheme="error" variant="outline">
          Delete workspace
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>Delete this workspace?</AlertDialog.Title>
          <AlertDialog.Description>
            All projects, members and settings will be permanently removed.
            This action cannot be undone.
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Close>
            <Button variant="outline" colorScheme="gray">
              Cancel
            </Button>
          </AlertDialog.Close>
          <AlertDialog.Close>
            <Button colorScheme="error">Delete workspace</Button>
          </AlertDialog.Close>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
}
