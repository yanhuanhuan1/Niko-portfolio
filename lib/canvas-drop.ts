import type { DragEvent } from "react";

export async function collectDroppedImageFiles(
  event: DragEvent<HTMLElement | HTMLDivElement>
): Promise<File[]> {
  const directFiles = Array.from(event.dataTransfer.files ?? []).filter((file) =>
    file.type.startsWith("image/")
  );

  const items = Array.from(event.dataTransfer.items ?? []);
  if (!items.length) {
    return directFiles;
  }

  const collected: File[] = [];

  const addFile = (file: File | null): void => {
    if (file && file.type.startsWith("image/")) {
      collected.push(file);
    }
  };

  const visitEntry = async (entry: FileSystemEntry | null): Promise<void> => {
    if (!entry) {
      return;
    }

    if (entry.isFile) {
      await new Promise<void>((resolve) => {
        (entry as FileSystemFileEntry).file((file) => {
          addFile(file);
          resolve();
        }, () => resolve());
      });
      return;
    }

    if (entry.isDirectory) {
      const reader = (entry as FileSystemDirectoryEntry).createReader();

      while (true) {
        const entries = await new Promise<FileSystemEntry[]>((resolve) => {
          reader.readEntries(
            (batch: FileSystemEntry[]) => resolve(batch),
            () => resolve([])
          );
        });

        if (!entries.length) {
          break;
        }

        for (const child of entries) {
          await visitEntry(child);
        }
      }
    }
  };

  for (const item of items) {
    const webkitGetAsEntry = (
      item as DataTransferItem & {
        webkitGetAsEntry?: () => FileSystemEntry | null;
      }
    ).webkitGetAsEntry;

    if (typeof webkitGetAsEntry === "function") {
      await visitEntry(webkitGetAsEntry.call(item));
    }
  }

  return collected.length > 0 ? collected : directFiles;
}
