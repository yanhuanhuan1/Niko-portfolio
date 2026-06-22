"use client";

import type { Node } from "@xyflow/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ImagePlus,
  Plus,
  Save,
  UploadCloud,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";

import type {
  CanvasNodeData,
  CanvasTextAlign,
  ProjectCanvas,
} from "@/data/projectCanvases";
import { t } from "@/content/site-content";
import { useLanguage } from "@/lib/language";

type CanvasInlineEditorProps = {
  project: ProjectCanvas;
  selectedNode: Node<CanvasNodeData> | null;
  nodes: Node<CanvasNodeData>[];
  onClose: () => void;
  onPreviewNode: (
    nodeId: string,
    patch: Partial<
      Pick<
        CanvasNodeData,
        "title" | "description" | "textAlign" | "textColor" | "fontSize"
      >
    >
  ) => void;
  onClearPreview: () => void;
};

type UploadItem = {
  id: string;
  file: File;
  caption: string;
  width: number;
  height: number;
};

const ALIGN_OPTIONS: Array<{
  value: CanvasTextAlign;
  label: string;
  icon: typeof AlignLeft;
}> = [
  { value: "left", label: "左对齐", icon: AlignLeft },
  { value: "center", label: "居中", icon: AlignCenter },
  { value: "right", label: "右对齐", icon: AlignRight },
];

function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getImageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new window.Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: image.naturalWidth || 1200,
        height: image.naturalHeight || 900,
      });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 1200, height: 900 });
    };
    image.src = url;
  });
}

function getFallbackCaption(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
}

export function CanvasInlineEditor({
  project,
  selectedNode,
  nodes,
  onClose,
  onPreviewNode,
  onClearPreview,
}: CanvasInlineEditorProps): ReactNode {
  const router = useRouter();
  const { language } = useLanguage();
  const rootNode = useMemo(
    () => nodes.find((node) => node.data.parentId === null) ?? nodes[0] ?? null,
    [nodes]
  );
  const selectedThemeNode = useMemo(() => {
    if (selectedNode?.data.kind !== "image" && selectedNode?.data.categoryKey) {
      return selectedNode;
    }

    if (selectedNode?.data.parentId) {
      return (
        nodes.find(
          (node) =>
            node.id === selectedNode.data.parentId && node.data.categoryKey
        ) ?? null
      );
    }

    return null;
  }, [nodes, selectedNode]);
  const parentForNewTheme = selectedThemeNode ?? rootNode;
  const targetTitle = selectedThemeNode
    ? t(selectedThemeNode.data.title, language)
    : "未选择主题";
  const [titleZh, setTitleZh] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descriptionZh, setDescriptionZh] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [textAlign, setTextAlign] = useState<CanvasTextAlign>("center");
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(42);
  const [newThemeKey, setNewThemeKey] = useState("");
  const [newThemeTitleZh, setNewThemeTitleZh] = useState("");
  const [newThemeTitleEn, setNewThemeTitleEn] = useState("");
  const [newThemeDescriptionZh, setNewThemeDescriptionZh] = useState("");
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      if (!selectedThemeNode) {
        onClearPreview();
        setTitleZh("");
        setTitleEn("");
        setDescriptionZh("");
        setDescriptionEn("");
        setTextAlign("center");
        setTextColor("#ffffff");
        setFontSize(42);
        return;
      }

      setTitleZh(selectedThemeNode.data.title.zh);
      setTitleEn(selectedThemeNode.data.title.en ?? "");
      setDescriptionZh(selectedThemeNode.data.description.zh);
      setDescriptionEn(selectedThemeNode.data.description.en ?? "");
      setTextAlign(selectedThemeNode.data.textAlign ?? "center");
      setTextColor(selectedThemeNode.data.textColor ?? "#ffffff");
      setFontSize(selectedThemeNode.data.fontSize ?? 42);
    });

    return () => {
      cancelled = true;
    };
  }, [onClearPreview, selectedThemeNode]);

  useEffect(() => {
    if (!selectedThemeNode) return;

    onPreviewNode(selectedThemeNode.id, {
      title: { zh: titleZh, en: titleEn || undefined },
      description: { zh: descriptionZh, en: descriptionEn || undefined },
      textAlign,
      textColor,
      fontSize,
    });
  }, [
    descriptionEn,
    descriptionZh,
    fontSize,
    onPreviewNode,
    selectedThemeNode,
    textAlign,
    textColor,
    titleEn,
    titleZh,
  ]);

  const handleUploadChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      if (!files.length) return;

      const nextUploads = await Promise.all(
        files.map(async (file, index) => {
          const size = await getImageSize(file);

          return {
            id: `${file.name}-${file.lastModified}-${index}`,
            file,
            caption: getFallbackCaption(file.name),
            width: size.width,
            height: size.height,
          };
        })
      );

      setUploads((current) => [...current, ...nextUploads]);
      event.target.value = "";
    },
    []
  );

  const updateUploadCaption = useCallback((id: string, caption: string) => {
    setUploads((current) =>
      current.map((upload) =>
        upload.id === id ? { ...upload, caption } : upload
      )
    );
  }, []);

  const removeUpload = useCallback((id: string) => {
    setUploads((current) => current.filter((upload) => upload.id !== id));
  }, []);

  const appendUploads = useCallback(
    (formData: FormData) => {
      uploads.forEach((upload, index) => {
        formData.append("files", upload.file);
        formData.append(`caption_${index}`, upload.caption);
        formData.append(`width_${index}`, String(upload.width));
        formData.append(`height_${index}`, String(upload.height));
      });
    },
    [uploads]
  );

  const postCanvasDraft = useCallback(async (formData: FormData) => {
    const response = await fetch("/api/canvas-editor", {
      method: "POST",
      body: formData,
    });
    const result = (await response.json()) as {
      ok?: boolean;
      error?: string;
    };

    if (!response.ok || !result.ok) {
      throw new Error(result.error ?? "保存失败");
    }
  }, []);

  const saveCurrentTheme = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setMessage(null);

      if (!selectedThemeNode?.data.categoryKey) {
        setError("请先在画布中选择一个主题节点。");
        return;
      }

      const formData = new FormData();
      formData.append("slug", project.slug);
      formData.append("categoryKey", selectedThemeNode.data.categoryKey);
      formData.append("parentId", selectedThemeNode.data.parentId ?? "");
      formData.append("titleZh", titleZh);
      formData.append("titleEn", titleEn);
      formData.append("descriptionZh", descriptionZh);
      formData.append("descriptionEn", descriptionEn);
      formData.append("textAlign", textAlign);
      formData.append("textColor", textColor);
      formData.append("fontSize", String(fontSize));
      appendUploads(formData);

      setIsSaving(true);
      try {
        await postCanvasDraft(formData);
        setUploads([]);
        setMessage("当前主题已保存，画布会刷新读取最新内容。");
        router.refresh();
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : "保存失败");
      } finally {
        setIsSaving(false);
      }
    },
    [
      appendUploads,
      descriptionEn,
      descriptionZh,
      fontSize,
      postCanvasDraft,
      project.slug,
      router,
      selectedThemeNode,
      textAlign,
      textColor,
      titleEn,
      titleZh,
    ]
  );

  const createChildTheme = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setMessage(null);

      const categoryKey = normalizeKey(newThemeKey || newThemeTitleZh);
      if (!categoryKey) {
        setError("请填写新主题 key 或中文标题。");
        return;
      }
      if (!newThemeTitleZh.trim()) {
        setError("新主题需要中文标题。");
        return;
      }

      const formData = new FormData();
      formData.append("slug", project.slug);
      formData.append("categoryKey", categoryKey);
      formData.append(
        "parentId",
        parentForNewTheme?.id ?? `${project.slug}-root`
      );
      formData.append("titleZh", newThemeTitleZh.trim());
      formData.append("titleEn", newThemeTitleEn.trim());
      formData.append("descriptionZh", newThemeDescriptionZh.trim());
      formData.append("textAlign", "center");
      formData.append("textColor", "#ffffff");
      formData.append("fontSize", "42");

      setIsSaving(true);
      try {
        await postCanvasDraft(formData);
        setNewThemeKey("");
        setNewThemeTitleZh("");
        setNewThemeTitleEn("");
        setNewThemeDescriptionZh("");
        setMessage("新主题已创建，并已自动连到当前父级。");
        router.refresh();
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : "保存失败");
      } finally {
        setIsSaving(false);
      }
    },
    [
      newThemeDescriptionZh,
      newThemeKey,
      newThemeTitleEn,
      newThemeTitleZh,
      parentForNewTheme?.id,
      postCanvasDraft,
      project.slug,
      router,
    ]
  );

  return (
    <aside className="pointer-events-auto absolute top-20 right-4 z-30 flex max-h-[calc(100%-6rem)] w-[min(26rem,calc(100%-2rem))] flex-col overflow-hidden rounded-[1.5rem] border border-white/12 bg-[#081018]/90 text-white shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4 border-b border-white/8 px-4 py-4">
        <div>
          <p className="text-[10px] tracking-[0.28em] text-white/38 uppercase">
            Canvas template editor
          </p>
          <h2 className="mt-1 text-lg font-medium tracking-tight">
            画布内编辑
          </h2>
          <p className="mt-1 text-xs leading-5 text-white/46">
            当前主题：{targetTitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/62 transition-colors hover:bg-white/[0.08] hover:text-white"
          aria-label="关闭画布编辑器"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="overflow-auto px-4 py-4">
        <form onSubmit={saveCurrentTheme} className="grid gap-4">
          <section className="grid gap-3 rounded-[1.2rem] border border-white/8 bg-white/[0.035] p-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium">编辑选中主题</h3>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/46">
                {selectedThemeNode?.data.categoryKey ?? "no theme"}
              </span>
            </div>
            <label className="grid gap-1.5 text-xs text-white/58">
              中文标题
              <input
                value={titleZh}
                disabled={!selectedThemeNode}
                onChange={(event) => setTitleZh(event.target.value)}
                className="h-10 rounded-xl border border-white/10 bg-black/24 px-3 text-sm text-white transition-colors outline-none focus:border-white/28 disabled:opacity-45"
              />
            </label>
            <label className="grid gap-1.5 text-xs text-white/58">
              英文标题，可选
              <input
                value={titleEn}
                disabled={!selectedThemeNode}
                onChange={(event) => setTitleEn(event.target.value)}
                className="h-10 rounded-xl border border-white/10 bg-black/24 px-3 text-sm text-white transition-colors outline-none focus:border-white/28 disabled:opacity-45"
              />
            </label>
            <label className="grid gap-1.5 text-xs text-white/58">
              说明文字
              <textarea
                value={descriptionZh}
                disabled={!selectedThemeNode}
                onChange={(event) => setDescriptionZh(event.target.value)}
                rows={3}
                className="resize-none rounded-xl border border-white/10 bg-black/24 px-3 py-2 text-sm leading-6 text-white transition-colors outline-none focus:border-white/28 disabled:opacity-45"
              />
            </label>
            <label className="grid gap-1.5 text-xs text-white/58">
              英文说明，可选
              <textarea
                value={descriptionEn}
                disabled={!selectedThemeNode}
                onChange={(event) => setDescriptionEn(event.target.value)}
                rows={2}
                className="resize-none rounded-xl border border-white/10 bg-black/24 px-3 py-2 text-sm leading-6 text-white transition-colors outline-none focus:border-white/28 disabled:opacity-45"
              />
            </label>
          </section>

          <section className="grid gap-3 rounded-[1.2rem] border border-white/8 bg-white/[0.035] p-3">
            <h3 className="text-sm font-medium">文字样式</h3>
            <div className="flex gap-2">
              {ALIGN_OPTIONS.map((option) => {
                const Icon = option.icon;
                const active = textAlign === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={!selectedThemeNode}
                    onClick={() => setTextAlign(option.value)}
                    className={[
                      "inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border text-xs transition-colors disabled:opacity-45",
                      active
                        ? "border-white/28 bg-white/14 text-white"
                        : "border-white/10 bg-black/18 text-white/58 hover:bg-white/[0.06]",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {option.label}
                  </button>
                );
              })}
            </div>
            <label className="grid gap-1.5 text-xs text-white/58">
              字号：{fontSize}px
              <input
                type="range"
                min={22}
                max={78}
                value={fontSize}
                disabled={!selectedThemeNode}
                onChange={(event) => setFontSize(Number(event.target.value))}
                className="accent-white"
              />
            </label>
            <label className="flex items-center justify-between gap-3 text-xs text-white/58">
              文字颜色
              <input
                type="color"
                value={textColor}
                disabled={!selectedThemeNode}
                onChange={(event) => setTextColor(event.target.value)}
                className="h-10 w-16 rounded-xl border border-white/10 bg-black/24 p-1 disabled:opacity-45"
              />
            </label>
          </section>

          <section className="grid gap-3 rounded-[1.2rem] border border-white/8 bg-white/[0.035] p-3">
            <h3 className="text-sm font-medium">给当前主题上传图片</h3>
            <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/14 bg-black/18 px-3 py-4 text-center transition-colors hover:border-white/28">
              <UploadCloud className="h-5 w-5 text-white/46" />
              <span className="text-xs text-white/56">选择图片，可多选</span>
              <input
                type="file"
                multiple
                accept="image/*"
                disabled={!selectedThemeNode}
                onChange={handleUploadChange}
                className="sr-only"
              />
            </label>
            {uploads.length ? (
              <div className="grid gap-2">
                {uploads.map((upload) => (
                  <div
                    key={upload.id}
                    className="grid gap-2 rounded-xl border border-white/8 bg-black/18 p-2"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] text-white/46">
                      <span className="min-w-0 truncate">
                        {upload.file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeUpload(upload.id)}
                        className="text-white/56 hover:text-white"
                      >
                        移除
                      </button>
                    </div>
                    <input
                      value={upload.caption}
                      onChange={(event) =>
                        updateUploadCaption(upload.id, event.target.value)
                      }
                      className="h-9 rounded-lg border border-white/10 bg-black/24 px-2 text-xs text-white outline-none focus:border-white/28"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <button
            type="submit"
            disabled={!selectedThemeNode || isSaving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white text-sm font-medium text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {isSaving ? "保存中..." : "保存当前主题"}
          </button>
        </form>

        <form
          onSubmit={createChildTheme}
          className="mt-4 grid gap-3 rounded-[1.2rem] border border-white/8 bg-white/[0.035] p-3"
        >
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-white/54" aria-hidden="true" />
            <h3 className="text-sm font-medium">新增子主题并连线</h3>
          </div>
          <p className="text-xs leading-5 text-white/44">
            父级：
            {parentForNewTheme
              ? t(parentForNewTheme.data.title, language)
              : "项目根节点"}
          </p>
          <input
            value={newThemeKey}
            onChange={(event) => setNewThemeKey(event.target.value)}
            placeholder="主题 key，例如 plan-drawings"
            className="h-10 rounded-xl border border-white/10 bg-black/24 px-3 text-sm text-white transition-colors outline-none focus:border-white/28"
          />
          <input
            value={newThemeTitleZh}
            onChange={(event) => setNewThemeTitleZh(event.target.value)}
            placeholder="中文标题，例如 平面图纸"
            className="h-10 rounded-xl border border-white/10 bg-black/24 px-3 text-sm text-white transition-colors outline-none focus:border-white/28"
          />
          <input
            value={newThemeTitleEn}
            onChange={(event) => setNewThemeTitleEn(event.target.value)}
            placeholder="英文标题，可选"
            className="h-10 rounded-xl border border-white/10 bg-black/24 px-3 text-sm text-white transition-colors outline-none focus:border-white/28"
          />
          <textarea
            value={newThemeDescriptionZh}
            onChange={(event) => setNewThemeDescriptionZh(event.target.value)}
            rows={2}
            placeholder="说明文字，可选"
            className="resize-none rounded-xl border border-white/10 bg-black/24 px-3 py-2 text-sm leading-6 text-white transition-colors outline-none focus:border-white/28"
          />
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.08] text-sm font-medium text-white transition-colors hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
            创建主题
          </button>
        </form>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs leading-5 text-red-200">
            {error}
          </div>
        ) : null}
        {message ? (
          <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs leading-5 text-emerald-100">
            {message}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
