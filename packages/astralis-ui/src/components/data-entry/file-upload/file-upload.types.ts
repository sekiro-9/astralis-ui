import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";

/** Why a picked file was refused. */
export interface FileUploadRejection {
  file: File;
  reason: "size" | "count";
}

export interface FileUploadProps extends Omit<ComponentPropsWithoutRef<"div">, "onChange"> {
  /** Native accept filter (e.g. "image/*,.pdf") — enforced by the picker. */
  accept?: string;
  /** Allow more than one file. @default false */
  multiple?: boolean;
  /** Cap on the total number of kept files (multiple only). */
  maxFiles?: number;
  /** Per-file size cap, bytes. Oversized picks are rejected, not truncated. */
  maxSize?: number;
  /** Fires with the full kept list after every add/remove. */
  onFilesChange?: (files: File[]) => void;
  /** Fires with the picks that were refused and why. */
  onReject?: (rejections: FileUploadRejection[]) => void;
  disabled?: boolean;
  children: ReactNode;
}

export interface FileUploadDropzoneProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

export interface FileUploadTriggerProps {
  /** A single element (typically a Button) that opens the file picker. */
  children: ReactElement<Record<string, unknown>>;
}

export type FileUploadItemGroupProps = ComponentPropsWithoutRef<"ul">;

export interface FileUploadContextValue {
  files: File[];
  addFiles: (list: FileList | File[]) => void;
  removeFile: (file: File) => void;
  openPicker: () => void;
  dragging: boolean;
  setDragging: (dragging: boolean) => void;
  accept?: string;
  multiple: boolean;
  disabled?: boolean;
}
