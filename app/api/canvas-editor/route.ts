import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { DEFAULT_PROJECT_CANVAS_CATEGORY_KEYS } from "@/data/projectCanvases";

export const runtime = "nodejs";

type DraftImage = {
  fileName: string;
  thumbnailFileName?: string;
  caption?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
};

type DraftCategory = {
  parentId?: string;
  title?: {
    zh: string;
    en?: string;
  };
  description?: {
    zh: string;
    en?: string;
  };
  images?: DraftImage[];
  textAlign?: "left" | "center" | "right";
  textColor?: string;
  fontSize?: number;
  position?: {
    x: number;
    y: number;
  };
};

type DraftFile = {
  projects: Record<
    string,
    {
      categories: Record<string, DraftCategory>;
    }
  >;
};

const projectRoot = process.cwd();
const draftsPath = path.join(projectRoot, "data", "projectCanvasDrafts.json");
const publicProjectsRoot = path.join(projectRoot, "public", "projects");

function isEditorEnabled(): boolean {
  return process.env.NODE_ENV !== "production";
}

function jsonError(message: string, status = 400): NextResponse {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function sanitizeSegment(value: FormDataEntryValue | null): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\\/]+/g, "-")
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sanitizeFileName(name: string, fallback: string): string {
  const parsed = path.parse(name);
  const ext = parsed.ext.toLowerCase() || ".png";
  const base =
    parsed.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "") || fallback;

  return `${base}${ext}`;
}

function getString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function getNumber(formData: FormData, key: string): number | undefined {
  const value = Number(formData.get(key));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function getFiniteNumber(formData: FormData, key: string): number | undefined {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : undefined;
}

function getTextAlign(
  formData: FormData
): "left" | "center" | "right" | undefined {
  const value = getString(formData, "textAlign");
  return value === "left" || value === "center" || value === "right"
    ? value
    : undefined;
}

function getColor(formData: FormData): string | undefined {
  const value = getString(formData, "textColor");
  return /^#[0-9a-f]{6}$/i.test(value) ? value : undefined;
}

function collectDraftCategoryTree(
  categoryKey: string,
  categories: Record<string, DraftCategory>
): string[] {
  const childrenByParent = new Map<string, string[]>();

  for (const [key, category] of Object.entries(categories)) {
    if (!category.parentId) {
      continue;
    }

    const children = childrenByParent.get(category.parentId) ?? [];
    children.push(key);
    childrenByParent.set(category.parentId, children);
  }

  const removed: string[] = [];
  const visit = (key: string): void => {
    if (removed.includes(key)) {
      return;
    }

    removed.push(key);
    for (const child of childrenByParent.get(key) ?? []) {
      visit(child);
    }
  };

  visit(categoryKey);
  return removed;
}

async function readDrafts(): Promise<DraftFile> {
  try {
    const raw = await readFile(draftsPath, "utf8");
    const parsed = JSON.parse(raw) as Partial<DraftFile>;

    return {
      projects: parsed.projects ?? {},
    };
  } catch {
    return { projects: {} };
  }
}

async function writeDrafts(drafts: DraftFile): Promise<void> {
  await writeFile(draftsPath, `${JSON.stringify(drafts, null, 2)}\n`, "utf8");
}

export async function GET(): Promise<NextResponse> {
  if (!isEditorEnabled()) {
    return jsonError("Canvas editor is disabled in production.", 404);
  }

  return NextResponse.json({ ok: true, drafts: await readDrafts() });
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!isEditorEnabled()) {
    return jsonError("Canvas editor is disabled in production.", 404);
  }

  const formData = await request.formData();
  const slug = sanitizeSegment(formData.get("slug"));
  const categoryKey = sanitizeSegment(formData.get("categoryKey"));
  const action = getString(formData, "action");
  const parentId = sanitizeSegment(formData.get("parentId"));
  const categoryTitleZh =
    getString(formData, "categoryTitleZh") || getString(formData, "titleZh");
  const categoryTitleEn =
    getString(formData, "categoryTitleEn") || getString(formData, "titleEn");
  const descriptionZh = getString(formData, "descriptionZh");
  const descriptionEn = getString(formData, "descriptionEn");
  const textAlign = getTextAlign(formData);
  const textColor = getColor(formData);
  const fontSize = getNumber(formData, "fontSize");
  const positionX = getFiniteNumber(formData, "positionX");
  const positionY = getFiniteNumber(formData, "positionY");

  if (!slug) return jsonError("Missing project slug.");
  if (!categoryKey) return jsonError("Missing category key.");

  if (action === "delete") {
    if (
      DEFAULT_PROJECT_CANVAS_CATEGORY_KEYS.includes(
        categoryKey as (typeof DEFAULT_PROJECT_CANVAS_CATEGORY_KEYS)[number]
      )
    ) {
      return jsonError("Base themes cannot be deleted.");
    }

    const drafts = await readDrafts();
    const projectDraft = drafts.projects[slug];
    const categoryDraft = projectDraft?.categories?.[categoryKey];

    if (!projectDraft || !categoryDraft) {
      return jsonError("Theme draft not found.", 404);
    }

    const categoryKeysToDelete = collectDraftCategoryTree(
      categoryKey,
      projectDraft.categories
    );

    for (const key of categoryKeysToDelete) {
      delete projectDraft.categories[key];
      await rm(path.join(publicProjectsRoot, slug, key), {
        recursive: true,
        force: true,
      });
    }

    if (Object.keys(projectDraft.categories).length === 0) {
      delete drafts.projects[slug];
    } else {
      drafts.projects[slug] = projectDraft;
    }

    await writeDrafts(drafts);

    return NextResponse.json({
      ok: true,
      slug,
      categoryKey,
      deletedCategoryKeys: categoryKeysToDelete,
      draftPath: "data/projectCanvasDrafts.json",
    });
  }

  const files = formData.getAll("files").filter((file): file is File => {
    return file instanceof File && file.size > 0;
  });
  const uploadDir = path.join(publicProjectsRoot, slug, categoryKey);
  const resolvedUploadDir = path.resolve(uploadDir);
  const resolvedPublicProjectsRoot = path.resolve(publicProjectsRoot);

  if (!resolvedUploadDir.startsWith(resolvedPublicProjectsRoot)) {
    return jsonError("Invalid upload path.");
  }

  await mkdir(uploadDir, { recursive: true });

  const savedImages: DraftImage[] = [];

  for (const [index, file] of files.entries()) {
    if (!file.type.startsWith("image/")) {
      return jsonError(`Unsupported file type: ${file.name}`);
    }

    const savedName = `${Date.now()}-${index + 1}-${sanitizeFileName(
      file.name,
      `image-${index + 1}`
    )}`;
    const filePath = path.join(uploadDir, savedName);
    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(filePath, buffer);

    const width = getNumber(formData, `width_${index}`);
    const height = getNumber(formData, `height_${index}`);
    const aspectRatio =
      width && height && height > 0
        ? Number((width / height).toFixed(4))
        : undefined;
    const caption = getString(formData, `caption_${index}`);
    const image: DraftImage = {
      fileName: savedName,
      thumbnailFileName: savedName,
    };

    if (caption) image.caption = caption;
    if (width) image.width = width;
    if (height) image.height = height;
    if (aspectRatio) image.aspectRatio = aspectRatio;

    savedImages.push(image);
  }

  const drafts = await readDrafts();
  const projectDraft = drafts.projects[slug] ?? { categories: {} };
  const categoryDraft = projectDraft.categories[categoryKey] ?? {};
  const nextCategoryDraft: DraftCategory = {
    ...categoryDraft,
    images: [...(categoryDraft.images ?? []), ...savedImages],
  };

  if (parentId) {
    nextCategoryDraft.parentId = parentId;
  }

  if (categoryTitleZh || categoryTitleEn) {
    nextCategoryDraft.title = {
      zh: categoryTitleZh || categoryKey,
    };
    if (categoryTitleEn) nextCategoryDraft.title.en = categoryTitleEn;
  }
  if (descriptionZh || descriptionEn) {
    nextCategoryDraft.description = {
      zh: descriptionZh,
    };
    if (descriptionEn) nextCategoryDraft.description.en = descriptionEn;
  }
  if (textAlign) nextCategoryDraft.textAlign = textAlign;
  if (textColor) nextCategoryDraft.textColor = textColor;
  if (fontSize) nextCategoryDraft.fontSize = fontSize;
  if (positionX !== undefined && positionY !== undefined) {
    nextCategoryDraft.position = {
      x: Math.round(positionX),
      y: Math.round(positionY),
    };
  }

  projectDraft.categories[categoryKey] = nextCategoryDraft;
  drafts.projects[slug] = projectDraft;
  await writeDrafts(drafts);

  return NextResponse.json({
    ok: true,
    slug,
    categoryKey,
    savedImages,
    draftPath: "data/projectCanvasDrafts.json",
    folder: `/projects/${slug}/${categoryKey}`,
  });
}
