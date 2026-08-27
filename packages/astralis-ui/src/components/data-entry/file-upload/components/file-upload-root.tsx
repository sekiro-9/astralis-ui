"use client";

import { useCallback, useMemo, useRef, useState, type ChangeEvent } from "react";
import FileUploadContext from "../file-upload.context";
import type { FileUploadProps, FileUploadRejection } from "../file-upload.types";

/**
 * File picking + drag-and-drop. The root owns the kept list and a hidden
 * native `<input type="file">` — the picker dialog, `accept` filtering and
 * mobile integrations stay the platform's. `maxSize`/`maxFiles` violations
 * are rejected (reported via `onReject`), never silently truncated.
 */
export function FileUploadRoot({
  accept,
  multiple = false,
  maxFiles,
  maxSize,
  onFilesChange,
  onReject,
  disabled,
  children,
  ...rest
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const addFiles = useCallback(
    (list: FileList | File[]) => {
      const picked = Array.from(list);
      const rejections: FileUploadRejection[] = [];
      let accepted = picked.filter((file) => {
        if (maxSize !== undefined && file.size > maxSize) {
          rejections.push({ file, reason: "size" });
          return false;
        }
        return true;
      });
      if (!multiple) accepted = accepted.slice(0, 1);

      // Callbacks fire outside the state updater (StrictMode double-invokes
      // updaters, which would double-report).
      let next = multiple ? [...files, ...accepted] : accepted;
      if (maxFiles !== undefined && next.length > maxFiles) {
        for (const file of next.slice(maxFiles)) rejections.push({ file, reason: "count" });
        next = next.slice(0, maxFiles);
      }
      setFiles(next);
      if (rejections.length) onReject?.(rejections);
      onFilesChange?.(next);
    },
    [files, multiple, maxFiles, maxSize, onFilesChange, onReject],
  );

  const removeFile = useCallback(
    (file: File) => {
      const next = files.filter((f) => f !== file);
      setFiles(next);
      onFilesChange?.(next);
    },
    [files, onFilesChange],
  );

  const openPicker = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    // Reset so picking the same file again still fires change.
    e.target.value = "";
  };

  const ctx = useMemo(
    () => ({ files, addFiles, removeFile, openPicker, dragging, setDragging, accept, multiple, disabled }),
    [files, addFiles, removeFile, openPicker, dragging, accept, multiple, disabled],
  );

  return (
    <FileUploadContext.Provider value={ctx}>
      <div {...rest}>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleInputChange}
          tabIndex={-1}
          aria-hidden="true"
          className="astralis:sr-only"
        />
        {children}
      </div>
    </FileUploadContext.Provider>
  );
}

FileUploadRoot.displayName = "FileUpload";
