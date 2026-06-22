"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";

import { t } from "@/content/site-content";
import { collectDroppedImageFiles } from "@/lib/canvas-drop";
import { useLanguage } from "@/lib/language";
import type { CanvasRuntimeNodeData } from "@/lib/project-canvas-tree";

type CanvasFlowNode = Node<CanvasRuntimeNodeData>;

const KIND_PALETTES: Record<
  CanvasRuntimeNodeData["kind"],
  { bg: string; fg: string; border: string; shadow: string }
> = {
  overview: {
    bg: "#d8d3db",
    fg: "#244c59",
    border: "rgba(255, 255, 255, 0.28)",
    shadow: "0 20px 36px rgba(0, 0, 0, 0.12)",
  },
  concept: {
    bg: "#716b63",
    fg: "#ffffff",
    border: "rgba(255, 255, 255, 0.16)",
    shadow: "0 18px 34px rgba(0, 0, 0, 0.16)",
  },
  plan: {
    bg: "#a89181",
    fg: "#ffffff",
    border: "rgba(255, 255, 255, 0.14)",
    shadow: "0 18px 34px rgba(0, 0, 0, 0.14)",
  },
  elevation: {
    bg: "#bdb3ae",
    fg: "#000000",
    border: "rgba(0, 0, 0, 0.08)",
    shadow: "0 18px 34px rgba(0, 0, 0, 0.11)",
  },
  model: {
    bg: "#d2c0b0",
    fg: "#000000",
    border: "rgba(0, 0, 0, 0.08)",
    shadow: "0 18px 34px rgba(0, 0, 0, 0.11)",
  },
  render: {
    bg: "#c4bcbb",
    fg: "#000000",
    border: "rgba(0, 0, 0, 0.08)",
    shadow: "0 18px 34px rgba(0, 0, 0, 0.11)",
  },
  final: {
    bg: "#726b65",
    fg: "#ffffff",
    border: "rgba(255, 255, 255, 0.16)",
    shadow: "0 18px 34px rgba(0, 0, 0, 0.16)",
  },
  note: {
    bg: "#cdb9a8",
    fg: "#000000",
    border: "rgba(0, 0, 0, 0.08)",
    shadow: "0 18px 34px rgba(0, 0, 0, 0.11)",
  },
  image: {
    bg: "#c7c0bc",
    fg: "#000000",
    border: "rgba(0, 0, 0, 0.08)",
    shadow: "0 18px 34px rgba(0, 0, 0, 0.11)",
  },
};

export function CanvasNode({
  data,
  selected,
}: NodeProps<CanvasFlowNode>): ReactNode {
  const { language } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const skipBlurCommitRef = useRef(false);
  const [titleDraft, setTitleDraft] = useState(() => t(data.title, language));
  const palette = KIND_PALETTES[data.kind];
  const isRoot = data.level === 1;
  const canRename = data.kind !== "image" && Boolean(data.categoryKey);
  const textAlign = data.textAlign ?? "center";
  const nodeTextColor = data.textColor ?? palette.fg;
  const description = t(data.description, language);
  const titleSize = isRoot
    ? "text-[clamp(2.8rem,5vw,4.8rem)]"
    : "text-[clamp(1.8rem,3vw,3.25rem)]";
  const alignClass =
    textAlign === "left"
      ? "items-start"
      : textAlign === "right"
        ? "items-end"
        : "items-center";
  const badge = data.level === 2 ? "1" : null;
  const canToggle = data.hasChildren;
  const ToggleIcon = data.isExpanded ? ChevronDown : ChevronRight;
  const galleryImage = data.gallery?.[data.galleryIndex ?? 0] ?? null;
  const acceptFileDrop =
    data.kind !== "image" && Boolean(data.onUploadFiles || data.onCreateChildTheme);

  useEffect(() => {
    skipBlurCommitRef.current = false;
    const nextTitle = t(data.title, language);
    const frameId = window.requestAnimationFrame(() => {
      setTitleDraft(nextTitle);

      if (data.editing) {
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [data.editing, data.title, language]);

  const commitRename = (): void => {
    const nextTitle = titleDraft.trim();
    if (!nextTitle) {
      data.onCancelRename?.();
      return;
    }

    data.onCommitRename?.(nextTitle);
  };

  const handleDrop = (event: DragEvent<HTMLElement>): void => {
    if (!acceptFileDrop) return;

    event.preventDefault();
    event.stopPropagation();
    void collectDroppedImageFiles(event).then((files) => {
      if (!files.length) return;

      if (data.onUploadFiles && data.categoryKey) {
        data.onUploadFiles(files);
        return;
      }

      data.onCreateChildTheme?.(files);
    });
  };

  if (data.kind === "image" && galleryImage) {
    const label = galleryImage.caption ?? t(galleryImage.alt, language);

    return (
      <article
        className={[
          "group relative h-full w-full overflow-hidden rounded-[1.1rem] border bg-black/24 transition-all duration-300",
          selected ? "scale-[1.01]" : "",
        ].join(" ")}
        style={{
          borderColor: selected
            ? "rgba(255,255,255,0.34)"
            : "rgba(255,255,255,0.12)",
          boxShadow: selected
            ? "0 24px 60px rgba(0, 0, 0, 0.24)"
            : "0 18px 42px rgba(0, 0, 0, 0.18)",
        }}
        onDragOver={(event) => {
          if (!acceptFileDrop) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        }}
        onDrop={handleDrop}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="!h-2.5 !w-2.5 !border-0 !bg-white/0 !opacity-0"
        />
        <Handle
          type="source"
          position={Position.Right}
          className="!h-2.5 !w-2.5 !border-0 !bg-white/0 !opacity-0"
        />

        <Image
          src={galleryImage.thumbnailSrc}
          alt={t(galleryImage.alt, language)}
          fill
          sizes="236px"
          className="object-contain"
        />

        <div className="pointer-events-none absolute inset-x-2 bottom-2 flex items-center justify-between gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="min-w-0 truncate rounded-full border border-white/12 bg-black/62 px-2.5 py-1 text-[10px] leading-none text-white/82 backdrop-blur-md">
            {label}
          </span>
          {data.gallery && data.gallery.length > 1 ? (
            <span className="shrink-0 rounded-full border border-white/12 bg-black/62 px-2 py-1 text-[10px] leading-none text-white/66 backdrop-blur-md">
              {(data.galleryIndex ?? 0) + 1}/{data.gallery.length}
            </span>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <article
      className={[
        "group relative flex h-full w-full items-center justify-center overflow-hidden rounded-[1.9rem] border px-6 transition-all duration-300",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_60%)] before:content-['']",
        selected ? "scale-[1.01]" : "",
      ].join(" ")}
      style={{
        backgroundColor: palette.bg,
        color: palette.fg,
        borderColor: selected ? "rgba(255,255,255,0.32)" : palette.border,
        boxShadow: selected
          ? "0 24px 54px rgba(0, 0, 0, 0.16)"
          : palette.shadow,
      }}
      onDragOver={(event) => {
        if (!acceptFileDrop) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDrop={handleDrop}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2.5 !w-2.5 !border-0 !bg-white/0 !opacity-0 transition-opacity group-hover:!opacity-100"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !border-0 !bg-white/0 !opacity-0 transition-opacity group-hover:!opacity-100"
      />

      <div
        className={`relative z-10 flex w-full flex-col gap-3 ${alignClass}`}
        style={{ textAlign }}
      >
        {canRename && data.editing ? (
          <input
            ref={inputRef}
            className="nodrag nopan w-full rounded-[1rem] border border-white/18 bg-black/12 px-4 py-3 text-[1rem] font-semibold tracking-tight text-inherit outline-none ring-2 ring-white/14 backdrop-blur-md"
            style={{
              color: nodeTextColor,
              fontSize: data.fontSize ? `${data.fontSize}px` : undefined,
              textAlign,
            }}
            value={titleDraft}
            onChange={(event) => setTitleDraft(event.target.value)}
            onBlur={() => {
              if (skipBlurCommitRef.current) {
                skipBlurCommitRef.current = false;
                return;
              }

              commitRename();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                skipBlurCommitRef.current = true;
                commitRename();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                skipBlurCommitRef.current = true;
                data.onCancelRename?.();
                setTitleDraft(t(data.title, language));
              }
            }}
            autoComplete="off"
            spellCheck={false}
          />
        ) : (
          <h3
            className={[
              titleSize,
              "break-words leading-[0.95] font-semibold tracking-tight",
            ].join(" ")}
            style={{
              color: nodeTextColor,
              fontSize: data.fontSize ? `${data.fontSize}px` : undefined,
            }}
          >
            {t(data.title, language)}
          </h3>
        )}
        {!isRoot && description && !data.editing ? (
          <p
            className="text-[0.86rem] leading-5 font-medium opacity-70 break-words"
            style={{ color: nodeTextColor }}
          >
            {description}
          </p>
        ) : null}
      </div>

      {badge || canToggle ? (
        <div className="absolute top-1/2 -right-12 flex -translate-y-1/2 items-center gap-2 text-[0.95rem]">
          <span className="h-px w-6 rounded-full bg-current/35" />
          {badge ? (
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-current/28 bg-transparent text-[1.05rem] leading-none font-medium text-current/65">
              {badge}
            </span>
          ) : null}
          {canToggle ? (
            <button
              type="button"
              aria-label={
                data.isExpanded ? "Collapse children" : "Expand children"
              }
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                data.onToggleExpansion?.();
              }}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-current/28 bg-transparent text-current/70 transition-colors hover:bg-black/5"
            >
              <ToggleIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
