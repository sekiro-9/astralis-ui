import { FileUploadRoot } from "./components/file-upload-root";
import { FileUploadDropzone, FileUploadTrigger, FileUploadItemGroup } from "./components/file-upload-parts";

// 1️⃣ Compound API
export const FileUpload = Object.assign(FileUploadRoot, {
  Dropzone: FileUploadDropzone,
  Trigger: FileUploadTrigger,
  ItemGroup: FileUploadItemGroup,
});

// 2️⃣ Flat exports
export { FileUploadDropzone, FileUploadTrigger, FileUploadItemGroup };

// 3️⃣ Type exports
export type {
  FileUploadProps,
  FileUploadDropzoneProps,
  FileUploadTriggerProps,
  FileUploadItemGroupProps,
  FileUploadRejection,
  FileUploadContextValue,
} from "./file-upload.types";
