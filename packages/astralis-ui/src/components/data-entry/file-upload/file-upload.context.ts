"use client";

import { createContext, useContext } from "react";
import type { FileUploadContextValue } from "./file-upload.types";

const FileUploadContext = createContext<FileUploadContextValue | null>(null);

export function useFileUploadContext(): FileUploadContextValue {
  const ctx = useContext(FileUploadContext);
  if (!ctx) throw new Error("FileUpload sub-components must be used within <FileUpload>");
  return ctx;
}

export default FileUploadContext;
