"use client";

import { cloneElement, type DragEvent, type KeyboardEvent, type MouseEvent } from "react";
import { useFileUploadContext } from "../file-upload.context";
import type { FileUploadDropzoneProps, FileUploadTriggerProps, FileUploadItemGroupProps } from "../file-upload.types";
import {
  fileUploadDropzone,
  fileUploadDropzoneDisabled,
  fileUploadItemGroup,
  fileUploadItem,
  fileUploadItemIcon,
  fileUploadItemName,
  fileUploadItemSize,
  fileUploadItemRemove,
  formatFileSize,
} from "../file-upload.styles";
import { astralisMerge } from "../../../../utils/astralis-merge";
import { resolveServerChild } from "../../../../utils/resolve-server-child";
import { UploadIcon, FileIcon, XIcon } from "../../../icon/internal-icons";

/** The drop target — also a click/keyboard target that opens the picker. */
export function FileUploadDropzone({ children, className = "", ...rest }: FileUploadDropzoneProps) {
  const { openPicker, addFiles, dragging, setDragging, disabled } = useFileUploadContext();

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? undefined : 0}
      aria-disabled={disabled || undefined}
      data-dragging={dragging || undefined}
      onClick={openPicker}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openPicker();
        }
      }}
      onDragOver={(e: DragEvent) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={astralisMerge(fileUploadDropzone, disabled && fileUploadDropzoneDisabled, className)}
      {...rest}
    >
      {children ?? (
        <>
          <UploadIcon aria-hidden="true" className="astralis:size-6 astralis:text-label-subtle" />
          <span className="astralis:text-sm astralis:text-label-muted">
            Drag files here or click to browse
          </span>
        </>
      )}
    </div>
  );
}

FileUploadDropzone.displayName = "FileUpload.Dropzone";

/** Wraps a single element (e.g. a Button) and opens the picker on click. */
export function FileUploadTrigger({ children }: FileUploadTriggerProps) {
  const { openPicker } = useFileUploadContext();
  const child = resolveServerChild(children) as FileUploadTriggerProps["children"];
  return cloneElement(child, {
    onClick: (e: MouseEvent) => {
      (child.props.onClick as ((e: MouseEvent) => void) | undefined)?.(e);
      openPicker();
    },
  } as Record<string, unknown>);
}

FileUploadTrigger.displayName = "FileUpload.Trigger";

/** The kept files, each with name, human size and a remove control. */
export function FileUploadItemGroup({ className = "", ...rest }: FileUploadItemGroupProps) {
  const { files, removeFile } = useFileUploadContext();
  if (!files.length) return null;

  return (
    <ul className={astralisMerge(fileUploadItemGroup, className)} {...rest}>
      {files.map((file, i) => (
        <li key={`${file.name}-${file.size}-${i}`} className={fileUploadItem}>
          <span aria-hidden="true" className={fileUploadItemIcon}>
            <FileIcon />
          </span>
          <span className="astralis:flex astralis:flex-col astralis:min-w-0">
            <span className={fileUploadItemName}>{file.name}</span>
            <span className={fileUploadItemSize}>{formatFileSize(file.size)}</span>
          </span>
          <button
            type="button"
            aria-label={`Remove ${file.name}`}
            onClick={() => removeFile(file)}
            className={fileUploadItemRemove}
          >
            <XIcon />
          </button>
        </li>
      ))}
    </ul>
  );
}

FileUploadItemGroup.displayName = "FileUpload.ItemGroup";
