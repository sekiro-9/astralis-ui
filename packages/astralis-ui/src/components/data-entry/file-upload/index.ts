import { FileUploadRoot } from "./components/file-upload-root";
import { FileUploadDropzone, FileUploadTrigger, FileUploadItemGroup } from "./components/file-upload-parts";

export const FileUpload = Object.assign(FileUploadRoot, {
  Dropzone: FileUploadDropzone,
  Trigger: FileUploadTrigger,
  ItemGroup: FileUploadItemGroup,
});

export { FileUploadDropzone, FileUploadTrigger, FileUploadItemGroup };

export type {
  FileUploadProps,
  FileUploadDropzoneProps,
  FileUploadTriggerProps,
  FileUploadItemGroupProps,
  FileUploadRejection,
  FileUploadContextValue,
} from "./file-upload.types";
