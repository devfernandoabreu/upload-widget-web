import * as Progress from "@radix-ui/react-progress";
import { motion } from "motion/react";
import { Download, ImageUp, Link2, RefreshCcw, X } from "lucide-react";
import { Button } from "./ui/button";
import { useUploads, type Upload } from "../store/uploads";
import { formatBytes } from "../utils/format-bytes";
import { useEffect, useState } from "react";

interface UploadWidgetUploadItemProps {
  uploadId: string;
  upload: Upload;
}

export function UploadWidgetUploadItem({
  uploadId,
  upload,
}: UploadWidgetUploadItemProps) {
  const cancelUpload = useUploads((store) => store.cancelUpload);
  const retryUpload = useUploads((store) => store.retryUpload);

  const progress = Math.min(
    upload.compressedSizeInBytes
      ? Math.round(
          (upload.uploadSizeInBytes * 100) / upload.compressedSizeInBytes,
        )
      : 0,
    100,
  );

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="p-3 rounded-lg flex flex-col gap-3 shadow-shape-content bg-white/2 relative"
    >
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium flex items-center gap-1">
          <ImageUp className="size-3 text-zinc-300" strokeWidth={1.5} />
          <span>{upload.name}</span>
        </span>

        <span className="text-xxs text-zinc-400 flex gap-1.5 items-center">
          <span className="line-through">{formatBytes(upload.file.size)}</span>
          <div className="size-1 rounded-full bg-zinc-700" />
          <span>
            {upload.compressedSizeInBytes !== undefined && (
              <span className="text-green-400 ml-1">
                -
                {Math.round(
                  ((upload.originalSizeInBytes - upload.compressedSizeInBytes) *
                    100) /
                    upload.originalSizeInBytes,
                )}
                %
              </span>
            )}
          </span>
          <div className="size-1 rounded-full bg-zinc-700" />

          {upload.status === "success" && <span>100%</span>}
          {upload.status === "progress" && <span>{progress}%</span>}
          {upload.status === "error" && (
            <span className="text-red-400">Error</span>
          )}
          {upload.status === "canceled" && (
            <span className="text-amber-400">Canceled</span>
          )}
        </span>
      </div>

      <Progress.Root
        value={progress}
        data-status={upload.status}
        className="group bg-zinc-800 rounded-full h-1 overflow-hidden"
      >
        <Progress.ProgressIndicator
          className="bg-indigo-500 h-1 group-data-[status=success]:bg-green-400 group-data-[status=error]:bg-red-400 group-data-[status=canceled]:bg-yellow-400"
          style={{
            width: upload.status === "progress" ? `${progress}%` : "100%",
          }}
        />
      </Progress.Root>

      <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
        <Button
          size="icon-sm"
          aria-disabled={upload.status !== "success"}
          asChild
        >
          <a href={upload.remoteUrl} target="_blank">
            <Download className="size-4" strokeWidth={1.5} />
            <span className="sr-only">Download compressed image</span>
          </a>
        </Button>

        <div className="relative">
          {copied && (
            <span
              role="status"
              className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-700 px-2 py-1 text-xxs text-zinc-100 shadow-sm"
            >
              Copiado!
              <span className="absolute left-1/2 top-full size-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-zinc-700" />
            </span>
          )}

          <Button
            size="icon-sm"
            disabled={!upload.remoteUrl}
            onClick={async () => {
              if (!upload.remoteUrl) return;

              try {
                await navigator.clipboard.writeText(upload.remoteUrl);
                setCopied(true);
              } catch (error) {
                console.error("Erro ao copiar:", error);
              }
            }}
          >
            <Link2 className="size-4" strokeWidth={1.5} />
            <span className="sr-only">Copy remote URL</span>
          </Button>
        </div>

        <Button
          disabled={["canceled", "error"].includes(upload.status)}
          size="icon-sm"
          onClick={() => retryUpload(uploadId)}
        >
          <RefreshCcw className="size-4" strokeWidth={1.5} />
          <span className="sr-only">Retry upload</span>
        </Button>

        <Button
          disabled={upload.status !== "progress"}
          size="icon-sm"
          onClick={() => cancelUpload(uploadId)}
        >
          <X className="size-4" strokeWidth={1.5} />
          <span className="sr-only">Cancel upload</span>
        </Button>
      </div>
    </motion.div>
  );
}
