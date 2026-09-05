import type { ComponentPropsWithoutRef, HTMLAttributes, ReactElement, ReactNode } from "react";
import type { PlacementProps } from "../../../utils/placement";

/** Why a picked file was refused. */
export interface FileUploadRejection {
  file: File;
  reason: "size" | "count";
}

export interface FileUploadProps extends Omit<ComponentPropsWithoutRef<"div">, "onChange">, PlacementProps {
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
  /** Inherited from `Field`. */
  disabled?: boolean;
  /** Paints the dropzone as invalid. Inherited from `Field`. */
  invalid?: boolean;
  children: ReactNode;
}

export interface FileUploadDropzoneProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

/** Everything but `children` is cloned onto the wrapped element. */
export interface FileUploadTriggerProps extends HTMLAttributes<HTMLElement> {
  /** A single element (typically a Button) that opens the file picker. */
  children: ReactElement<Record<string, unknown>>;
}

export type FileUploadItemGroupProps = ComponentPropsWithoutRef<"ul">;

/** @deprecated Internal context shape; it will stop being exported in the next minor. */
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
  invalid?: boolean;
}
