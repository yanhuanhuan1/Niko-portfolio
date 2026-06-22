import { Position, type Edge, type Node } from "@xyflow/react";

import {
  siteContent,
  type LocalizedImage,
  type LocalizedText,
} from "@/content/site-content";
import canvasDrafts from "./projectCanvasDrafts.json";

export type CanvasNodeKind =
  | "overview"
  | "concept"
  | "plan"
  | "elevation"
  | "model"
  | "render"
  | "final"
  | "note"
  | "image";

export type DefaultProjectCanvasCategoryKey =
  | "background"
  | "space-plan"
  | "visual"
  | "procurement"
  | "result";

export const DEFAULT_PROJECT_CANVAS_CATEGORY_KEYS = [
  "background",
  "space-plan",
  "visual",
  "procurement",
  "result",
] as const satisfies ReadonlyArray<DefaultProjectCanvasCategoryKey>;

export type ProjectCanvasCategoryKey =
  | DefaultProjectCanvasCategoryKey
  | (string & {});

export type CanvasGalleryImage = {
  src: string;
  thumbnailSrc: string;
  alt: LocalizedText;
  caption?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
};

export type CanvasTextAlign = "left" | "center" | "right";

export type CanvasNodeData = {
  kind: CanvasNodeKind;
  level: number;
  parentId: string | null;
  categoryKey?: ProjectCanvasCategoryKey;
  title: LocalizedText;
  description: LocalizedText;
  tags: ReadonlyArray<LocalizedText>;
  image?: LocalizedImage;
  gallery?: ReadonlyArray<CanvasGalleryImage>;
  galleryIndex?: number;
  role?: LocalizedText;
  date?: LocalizedText;
  textAlign?: CanvasTextAlign;
  textColor?: string;
  fontSize?: number;
};

export type ProjectCanvasMeta = {
  time: LocalizedText;
  type: LocalizedText;
  role: LocalizedText;
};

export type ProjectCanvas = {
  slug: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  meta: ProjectCanvasMeta;
  nodes: Node<CanvasNodeData>[];
  edges: Edge[];
};

type SummaryItem = (typeof siteContent.homeProjects.items)[number];

type CanvasCopy = {
  subtitle: LocalizedText;
  role: LocalizedText;
  researchNote: LocalizedText;
  constraintNote: LocalizedText;
  galleries?: Partial<Record<string, ReadonlyArray<CanvasGalleryImage>>>;
};

type CanvasDraftImage = {
  fileName: string;
  thumbnailFileName?: string;
  caption?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  alt?: LocalizedText;
};

type CanvasDraftCategory = {
  parentId?: string;
  title?: LocalizedText;
  description?: LocalizedText;
  images?: ReadonlyArray<CanvasDraftImage>;
  textAlign?: CanvasTextAlign;
  textColor?: string;
  fontSize?: number;
  position?: {
    x: number;
    y: number;
  };
};

type CanvasDraftProject = {
  categories?: Record<string, CanvasDraftCategory>;
};

type CanvasDraftFile = {
  projects?: Record<string, CanvasDraftProject>;
};

const canvasDraftFile = canvasDrafts as CanvasDraftFile;

const zhEn = (zh: string, en?: string): LocalizedText => ({ zh, en });

const GENERIC_TAGS = {
  overview: [
    zhEn("项目概览", "Overview"),
    zhEn("范围", "Scope"),
    zhEn("目标", "Goal"),
  ],
  concept: [
    zhEn("概念", "Concept"),
    zhEn("氛围", "Mood"),
    zhEn("叙事", "Narrative"),
  ],
  plan: [
    zhEn("平面", "Plan"),
    zhEn("动线", "Circulation"),
    zhEn("尺度", "Scale"),
  ],
  elevation: [
    zhEn("立面", "Elevation"),
    zhEn("材质", "Material"),
    zhEn("比例", "Proportion"),
  ],
  model: [
    zhEn("模型", "Model"),
    zhEn("体块", "Massing"),
    zhEn("推敲", "Refinement"),
  ],
  render: [
    zhEn("效果图", "Render"),
    zhEn("光线", "Lighting"),
    zhEn("质感", "Texture"),
  ],
  final: [
    zhEn("最终成果", "Final set"),
    zhEn("交付", "Delivery"),
    zhEn("收束", "Wrap-up"),
  ],
  note: [
    zhEn("补充说明", "Note"),
    zhEn("约束", "Constraint"),
    zhEn("反馈", "Feedback"),
  ],
  image: [
    zhEn("图片展示", "Image"),
    zhEn("参考", "Reference"),
    zhEn("校准", "Check"),
  ],
} as const;

const EDGE_STYLE = {
  stroke: "rgba(128, 114, 104, 0.88)",
  strokeWidth: 5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const GALLERY_THUMBNAIL_WIDTH = 236;
const GALLERY_THUMBNAIL_GAP = 24;
const GALLERY_THUMBNAIL_COLUMNS = 3;
const GALLERY_CLUSTER_OFFSET = { x: 420, y: -36 };
const GALLERY_MIN_HEIGHT = 132;
const GALLERY_MAX_HEIGHT = 228;

export function projectCanvasAssetPath(
  slug: string,
  categoryKey: ProjectCanvasCategoryKey,
  fileName: string
): string {
  return `/projects/${slug}/${categoryKey}/${fileName.replace(/^\/+/, "")}`;
}

export function createProjectGalleryImage({
  slug,
  categoryKey,
  fileName,
  thumbnailFileName,
  alt,
  caption,
  width,
  height,
  aspectRatio,
}: {
  slug: string;
  categoryKey: ProjectCanvasCategoryKey;
  fileName: string;
  thumbnailFileName: string;
  alt: LocalizedText;
  caption?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
}): CanvasGalleryImage {
  const image: CanvasGalleryImage = {
    src: projectCanvasAssetPath(slug, categoryKey, fileName),
    thumbnailSrc: projectCanvasAssetPath(slug, categoryKey, thumbnailFileName),
    alt,
  };

  if (caption) image.caption = caption;
  if (width) image.width = width;
  if (height) image.height = height;
  if (aspectRatio) image.aspectRatio = aspectRatio;

  return image;
}

function createDraftGalleryImages(
  slug: string,
  categoryKey: ProjectCanvasCategoryKey,
  category: CanvasDraftCategory | undefined
): CanvasGalleryImage[] {
  return (category?.images ?? []).map((image, index) => {
    const params: Parameters<typeof createProjectGalleryImage>[0] = {
      slug,
      categoryKey,
      fileName: image.fileName,
      thumbnailFileName: image.thumbnailFileName ?? image.fileName,
      alt:
        image.alt ??
        zhEn(image.caption ?? `${String(categoryKey)} ${index + 1}`),
    };

    if (image.caption) params.caption = image.caption;
    if (image.width) params.width = image.width;
    if (image.height) params.height = image.height;
    if (image.aspectRatio) params.aspectRatio = image.aspectRatio;

    return createProjectGalleryImage(params);
  });
}

const THEME_NODE_SIZE_LIMITS = {
  root: {
    minWidth: 420,
    maxWidth: 760,
    minHeight: 180,
    maxHeight: 320,
    horizontalPadding: 72,
    verticalPadding: 52,
    titleFontSize: 76,
    descriptionFontSize: 18,
    lineGap: 18,
  },
  standard: {
    minWidth: 280,
    maxWidth: 440,
    minHeight: 112,
    maxHeight: 208,
    horizontalPadding: 56,
    verticalPadding: 34,
    titleFontSize: 52,
    descriptionFontSize: 16,
    lineGap: 12,
  },
} as const;

function getLocalizedTextVariants(value: LocalizedText): string[] {
  return [value.zh, value.en].filter((entry): entry is string =>
    Boolean(entry?.trim())
  );
}

function estimateGlyphWidthRatio(character: string): number {
  if (/\s/u.test(character)) return 0.34;
  if (/[A-Z]/.test(character)) return 0.74;
  if (/[a-z0-9]/.test(character)) return 0.59;
  if (/[\u4e00-\u9fff]/.test(character)) return 1;
  if (/[.,;:!?/\\|()[\]{}<>"'`~-]/.test(character)) return 0.46;
  return 0.64;
}

function estimateTextWidth(text: string, fontSize: number): number {
  let widthUnits = 0;

  for (const character of Array.from(text.trim())) {
    widthUnits += estimateGlyphWidthRatio(character);
  }

  return widthUnits * fontSize;
}

function estimateLocalizedTextWidth(
  value: LocalizedText,
  fontSize: number
): number {
  const variants = getLocalizedTextVariants(value);
  if (!variants.length) return 0;

  return Math.max(
    ...variants.map((variant) => estimateTextWidth(variant, fontSize))
  );
}

function estimateLineCount(textWidth: number, availableWidth: number): number {
  if (!textWidth) return 1;

  return Math.max(1, Math.ceil(textWidth / Math.max(availableWidth, 1)));
}

function resolveThemeNodeSize(
  data: CanvasNodeData
): { width: number; height: number } {
  const sizing =
    data.level === 1 ? THEME_NODE_SIZE_LIMITS.root : THEME_NODE_SIZE_LIMITS.standard;
  const titleFontSize = data.fontSize ?? sizing.titleFontSize;
  const descriptionFontSize = Math.max(
    16,
    Math.round(data.fontSize ? data.fontSize * 0.34 : sizing.descriptionFontSize)
  );
  const titleWidth = estimateLocalizedTextWidth(data.title, titleFontSize);
  const descriptionWidth =
    data.level === 1 ? 0 : estimateLocalizedTextWidth(data.description, descriptionFontSize);
  const contentWidth = Math.max(titleWidth, descriptionWidth);
  const width = Math.round(
    Math.min(
      sizing.maxWidth,
      Math.max(
        sizing.minWidth,
        contentWidth + sizing.horizontalPadding * 2
      )
    )
  );
  const availableWidth = Math.max(1, width - sizing.horizontalPadding * 2);
  const titleLines = estimateLineCount(titleWidth, availableWidth);
  const descriptionLines =
    data.level === 1 || !descriptionWidth
      ? 0
      : estimateLineCount(descriptionWidth, availableWidth);
  const titleLineHeight = Math.round(titleFontSize * 1.05);
  const descriptionLineHeight = Math.round(descriptionFontSize * 1.35);
  const height = Math.round(
    Math.min(
      sizing.maxHeight,
      Math.max(
        sizing.minHeight,
        sizing.verticalPadding * 2 +
          titleLines * titleLineHeight +
          (descriptionLines
            ? sizing.lineGap + descriptionLines * descriptionLineHeight
            : 0)
      )
    )
  );

  return {
    width,
    height,
  };
}

function getMergedGalleryImages({
  slug,
  categoryKey,
  copy,
  draftCategory,
}: {
  slug: string;
  categoryKey: ProjectCanvasCategoryKey;
  copy: CanvasCopy;
  draftCategory: CanvasDraftCategory | undefined;
}): CanvasGalleryImage[] {
  return [
    ...(copy.galleries?.[categoryKey] ?? []),
    ...createDraftGalleryImages(slug, categoryKey, draftCategory),
  ];
}

function getGalleryImageRatio(image: CanvasGalleryImage): number {
  if (image.aspectRatio && image.aspectRatio > 0) return image.aspectRatio;
  if (image.width && image.height && image.width > 0 && image.height > 0) {
    return image.width / image.height;
  }

  return 4 / 3;
}

export function layoutGalleryCluster(
  anchorPosition: { x: number; y: number },
  images: ReadonlyArray<CanvasGalleryImage>
): Array<{
  position: { x: number; y: number };
  width: number;
  height: number;
}> {
  const columnCount = Math.max(
    1,
    Math.min(GALLERY_THUMBNAIL_COLUMNS, images.length)
  );
  const columnHeights = Array.from({ length: columnCount }, () => 0);

  return images.map((image) => {
    const shortestColumn = columnHeights.reduce(
      (bestIndex, columnHeight, index) =>
        columnHeight < columnHeights[bestIndex]! ? index : bestIndex,
      0
    );
    const ratio = getGalleryImageRatio(image);
    const width = GALLERY_THUMBNAIL_WIDTH;
    const height = Math.round(
      Math.min(GALLERY_MAX_HEIGHT, Math.max(GALLERY_MIN_HEIGHT, width / ratio))
    );
    const position = {
      x:
        anchorPosition.x +
        GALLERY_CLUSTER_OFFSET.x +
        shortestColumn * (GALLERY_THUMBNAIL_WIDTH + GALLERY_THUMBNAIL_GAP),
      y:
        anchorPosition.y +
        GALLERY_CLUSTER_OFFSET.y +
        columnHeights[shortestColumn]!,
    };

    columnHeights[shortestColumn] =
      columnHeights[shortestColumn]! + height + GALLERY_THUMBNAIL_GAP;

    return { position, width, height };
  });
}

function createNode(
  id: string,
  _kind: CanvasNodeKind,
  position: { x: number; y: number },
  width: number,
  height: number,
  data: CanvasNodeData
): Node<CanvasNodeData> {
  const size =
    data.kind === "image" ? { width, height } : resolveThemeNodeSize(data);

  return {
    id,
    type: "canvas",
    position,
    width: size.width,
    height: size.height,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    draggable: true,
    data,
    style: {
      width: size.width,
      height: size.height,
    },
  };
}

function createEdge(slug: string, source: string, target: string): Edge {
  return {
    id: `${slug}-${source}-to-${target}`,
    source,
    target,
    type: "bezier",
    style: EDGE_STYLE,
  };
}

function applyDraftCategoryData(
  data: CanvasNodeData,
  draftCategory: CanvasDraftCategory | undefined
): CanvasNodeData {
  if (!draftCategory) return data;

  const nextData: CanvasNodeData = {
    ...data,
    title: draftCategory.title ?? data.title,
    description: draftCategory.description ?? data.description,
  };

  const textAlign = draftCategory.textAlign ?? data.textAlign;
  const textColor = draftCategory.textColor ?? data.textColor;
  const fontSize = draftCategory.fontSize ?? data.fontSize;

  if (textAlign) nextData.textAlign = textAlign;
  if (textColor) nextData.textColor = textColor;
  if (fontSize) nextData.fontSize = fontSize;

  return nextData;
}

function createCategoryGalleryNodes({
  parentId,
  categoryKey,
  level,
  anchorPosition,
  images,
}: {
  parentId: string;
  categoryKey: ProjectCanvasCategoryKey;
  level: number;
  anchorPosition: { x: number; y: number };
  images: ReadonlyArray<CanvasGalleryImage>;
}): Node<CanvasNodeData>[] {
  const placements = layoutGalleryCluster(anchorPosition, images);

  return images.map((image, index) => {
    const placement = placements[index]!;
    const title = image.caption ? zhEn(image.caption) : image.alt;

    return createNode(
      `${parentId}-image-${String(index + 1).padStart(2, "0")}`,
      "image",
      placement.position,
      placement.width,
      placement.height,
      {
        kind: "image",
        level,
        parentId,
        categoryKey,
        title,
        description: image.caption ? zhEn(image.caption) : zhEn(""),
        tags: GENERIC_TAGS.image,
        gallery: images,
        galleryIndex: index,
      }
    );
  });
}

function _createProjectCanvas(
  summary: SummaryItem,
  copy: CanvasCopy
): ProjectCanvas {
  return createProjectCanvasFlat(summary, copy);
  /*
  const slug = summary.id;
  const overviewId = `${slug}-overview`;
  const conceptId = `${slug}-concept`;
  const planId = `${slug}-plan`;
  const elevationId = `${slug}-elevation`;
  const modelId = `${slug}-model`;
  const renderId = `${slug}-render`;
  const imageId = `${slug}-image`;
  const finalId = `${slug}-final`;
  const researchId = `${slug}-research`;
  const constraintId = `${slug}-constraint`;

  const nodes = [
    createNode(overviewId, "overview", { x: 0, y: 120 }, 332, 240, {
      kind: "overview",
      level: 1,
      parentId: null,
      title: zhEn("项目概览", "Overview"),
      description: summary.description,
      tags: GENERIC_TAGS.overview,
      role: copy.role,
      date: summary.meta,
    }),
    createNode(conceptId, "concept", { x: 360, y: 0 }, 320, 226, {
      kind: "concept",
      level: 2,
      parentId: overviewId,
      title: zhEn("设计概念", "Concept"),
      description: zhEn(
        "先把空间情绪、叙事重点和视觉节奏定下来，再进入后面的深化。",
        "Lock the atmosphere, story beats, and visual rhythm before moving into detail."
      ),
      tags: GENERIC_TAGS.concept,
    }),
    createNode(researchId, "note", { x: 360, y: 260 }, 290, 188, {
      kind: "note",
      level: 3,
      parentId: conceptId,
      title: zhEn("研究与对齐", "Research & alignment"),
      description: copy.researchNote,
      tags: GENERIC_TAGS.note,
    }),
    createNode(planId, "plan", { x: 720, y: -40 }, 320, 226, {
      kind: "plan",
      level: 3,
      parentId: conceptId,
      title: zhEn("平面方案", "Plan"),
      description: zhEn(
        "把动线、分区、入口和视觉停留点压回平面里，确认结构是否顺手。",
        "Bring circulation, zoning, entry points, and pauses back into the floor plan."
      ),
      tags: GENERIC_TAGS.plan,
    }),
    createNode(constraintId, "note", { x: 720, y: 230 }, 300, 188, {
      kind: "note",
      level: 4,
      parentId: planId,
      title: zhEn("施工与反馈", "Constraints & feedback"),
      description: copy.constraintNote,
      tags: GENERIC_TAGS.note,
    }),
    createNode(elevationId, "elevation", { x: 1080, y: 0 }, 318, 226, {
      kind: "elevation",
      level: 4,
      parentId: planId,
      title: zhEn("立面深化", "Elevation"),
      description: zhEn(
        "在立面里控制开口、材质和层次，让项目在近景和远景都保持稳定。",
        "Tune openings, materials, and layers so the project stays coherent in both close and distant views."
      ),
      tags: GENERIC_TAGS.elevation,
    }),
    createNode(modelId, "model", { x: 1440, y: 86 }, 318, 226, {
      kind: "model",
      level: 5,
      parentId: elevationId,
      title: zhEn("模型搭建", "Model"),
      description: zhEn(
        "通过体块模型校准比例与转折，确认纸面方案和实体空间一致。",
        "Use block modeling to check proportion and transitions before committing to execution."
      ),
      tags: GENERIC_TAGS.model,
    }),
    createNode(renderId, "render", { x: 1800, y: 172 }, 318, 226, {
      kind: "render",
      level: 6,
      parentId: modelId,
      title: zhEn("效果表现", "Render"),
      description: zhEn(
        "在光线、材质和景深里验证最终气质，让汇报更容易被感知。",
        "Validate the final tone through light, material, and depth so the story reads instantly."
      ),
      tags: GENERIC_TAGS.render,
    }),
    createNode(imageId, "image", { x: 2140, y: 252 }, 350, 286, {
      kind: "image",
      level: 7,
      parentId: renderId,
      title: zhEn("图片展示", "Image"),
      description: zhEn(
        "用一张更接近最终状态的画面，把成果、比例和气质收束在一起。",
        "Use a near-final image to bring the result, proportion, and atmosphere together."
      ),
      tags: GENERIC_TAGS.image,
      image: summary.image,
    }),
    createNode(finalId, "final", { x: 2500, y: 340 }, 326, 226, {
      kind: "final",
      level: 8,
      parentId: imageId,
      title: zhEn("最终输出", "Final"),
      description: zhEn(
        "把图纸、图像和说明整理成可以直接交付的最终版本。",
        "Package drawings, imagery, and notes into a clear deliverable."
      ),
      tags: GENERIC_TAGS.final,
      role: copy.role,
      date: summary.meta,
    }),
  ];

  const edges = [
    createEdge(slug, overviewId, conceptId),
    createEdge(slug, conceptId, planId),
    createEdge(slug, planId, elevationId),
    createEdge(slug, elevationId, modelId),
    createEdge(slug, modelId, renderId),
    createEdge(slug, renderId, imageId),
    createEdge(slug, imageId, finalId),
    createEdge(slug, conceptId, researchId),
    createEdge(slug, planId, constraintId),
  ];

  return {
    slug,
    title: summary.title,
    subtitle: copy.subtitle,
    meta: {
      time: summary.meta,
      type: summary.iconLabel,
      role: copy.role,
    },
    nodes,
    edges,
  };
}

*/
}

function createProjectCanvasFlat(
  summary: SummaryItem,
  copy: CanvasCopy
): ProjectCanvas {
  return createProjectCanvasTemplate(summary, copy);

  const slug = summary.id;
  const rootId = `${slug}-root`;
  const backgroundId = `${slug}-background`;
  const planId = `${slug}-space-plan`;
  const visualId = `${slug}-visual`;
  const procurementId = `${slug}-procurement`;
  const resultId = `${slug}-result`;
  const draftCategories = canvasDraftFile.projects?.[slug]?.categories ?? {};
  const categoryAnchors: Record<string, { x: number; y: number }> = {
    background: { x: 760, y: 120 },
    "space-plan": { x: 760, y: 320 },
    visual: { x: 760, y: 520 },
    procurement: { x: 760, y: 720 },
    result: { x: 760, y: 920 },
  };
  const defaultCategoryNodes = [
    { key: "background", id: backgroundId },
    { key: "space-plan", id: planId },
    { key: "visual", id: visualId },
    { key: "procurement", id: procurementId },
    { key: "result", id: resultId },
  ] satisfies ReadonlyArray<{
    key: DefaultProjectCanvasCategoryKey;
    id: string;
  }>;
  const defaultCategoryKeys = new Set<string>(
    defaultCategoryNodes.map((category) => category.key)
  );
  const draftOnlyCategories = Object.entries(draftCategories).filter(
    ([categoryKey, category]) =>
      !defaultCategoryKeys.has(categoryKey) &&
      Boolean(category.title || category.images?.length)
  );

  draftOnlyCategories.forEach(([categoryKey], index) => {
    categoryAnchors[categoryKey] = { x: 760, y: 1120 + index * 200 };
  });

  const draftCategoryNodes = draftOnlyCategories.map(([categoryKey]) => ({
    key: categoryKey as ProjectCanvasCategoryKey,
    id: `${slug}-${categoryKey}`,
  }));
  const categoryNodes = [...defaultCategoryNodes, ...draftCategoryNodes];
  const galleryNodes = categoryNodes.flatMap((category) =>
    createCategoryGalleryNodes({
      parentId: category.id,
      categoryKey: category.key,
      level: 3,
      anchorPosition: categoryAnchors[category.key]!,
      images: getMergedGalleryImages({
        slug,
        categoryKey: category.key,
        copy,
        draftCategory: draftCategories[category.key],
      }),
    })
  );
  const customCategoryNodes = draftOnlyCategories.map(
    ([categoryKey, category]) =>
      createNode(
        `${slug}-${categoryKey}`,
        "note",
        categoryAnchors[categoryKey]!,
        332,
        116,
        {
          kind: "note",
          level: 2,
          parentId: rootId,
          categoryKey,
          title: category.title ?? zhEn(categoryKey),
          description: zhEn(""),
          tags: GENERIC_TAGS.note,
        }
      )
  );

  const nodes = [
    createNode(rootId, "overview", { x: 0, y: 320 }, 560, 196, {
      kind: "overview",
      level: 1,
      parentId: null,
      title: summary.title,
      description: summary.description,
      tags: GENERIC_TAGS.overview,
      role: copy.role,
      date: summary.meta,
    }),
    createNode(
      backgroundId,
      "overview",
      categoryAnchors.background!,
      332,
      116,
      {
        kind: "overview",
        level: 2,
        parentId: rootId,
        categoryKey: "background",
        title: zhEn("项目背景", "Project background"),
        description: summary.description,
        tags: GENERIC_TAGS.overview,
        role: copy.role,
        date: summary.meta,
      }
    ),
    createNode(planId, "plan", categoryAnchors["space-plan"]!, 332, 116, {
      kind: "plan",
      level: 2,
      parentId: rootId,
      categoryKey: "space-plan",
      title: zhEn("空间方案", "Space plan"),
      description: zhEn(
        "围绕动线、功能分区和空间层级展开方案推导。",
        "Develop the scheme around circulation, zoning, and spatial hierarchy."
      ),
      tags: GENERIC_TAGS.plan,
    }),
    createNode(visualId, "render", categoryAnchors.visual!, 332, 116, {
      kind: "render",
      level: 2,
      parentId: rootId,
      categoryKey: "visual",
      title: zhEn("视觉呈现", "Visual presentation"),
      description: zhEn(
        "通过关键视角、材料气质和画面节奏确认最终表达。",
        "Lock the final expression through key views, material tone, and pacing."
      ),
      tags: GENERIC_TAGS.render,
      image: summary.image,
    }),
    createNode(procurementId, "note", categoryAnchors.procurement!, 332, 116, {
      kind: "note",
      level: 2,
      parentId: rootId,
      categoryKey: "procurement",
      title: zhEn("采购方案", "Procurement Plan"),
      description: zhEn(
        "整理施工限制、沟通反馈与现场协调要点。",
        "Collect construction constraints, feedback, and site coordination notes."
      ),
      tags: GENERIC_TAGS.note,
    }),
    createNode(resultId, "final", categoryAnchors.result!, 332, 116, {
      kind: "final",
      level: 2,
      parentId: rootId,
      categoryKey: "result",
      title: zhEn("项目成果", "Project result"),
      description: zhEn(
        "将图纸、效果图和说明整合成最终交付内容。",
        "Package drawings, imagery, and notes into the final deliverable."
      ),
      tags: GENERIC_TAGS.final,
      role: copy.role,
      date: summary.meta,
    }),
    ...customCategoryNodes,
    ...galleryNodes,
  ];

  const edges = [
    createEdge(slug, rootId, backgroundId),
    createEdge(slug, rootId, planId),
    createEdge(slug, rootId, visualId),
    createEdge(slug, rootId, procurementId),
    createEdge(slug, rootId, resultId),
    ...draftCategoryNodes.map((category) =>
      createEdge(slug, rootId, category.id)
    ),
  ];

  return {
    slug,
    title: summary.title,
    subtitle: copy.subtitle,
    meta: {
      time: summary.meta,
      type: summary.iconLabel,
      role: copy.role,
    },
    nodes,
    edges,
  };
}

function createProjectCanvasTemplate(
  summary: SummaryItem,
  copy: CanvasCopy
): ProjectCanvas {
  const slug = summary.id;
  const rootId = `${slug}-root`;
  const draftCategories = canvasDraftFile.projects?.[slug]?.categories ?? {};
  const nodes: Node<CanvasNodeData>[] = [];
  const edges: Edge[] = [];
  const nodesById = new Map<string, Node<CanvasNodeData>>();
  const childCountsByParent = new Map<string, number>();

  const addNode = (node: Node<CanvasNodeData>): void => {
    nodes.push(node);
    nodesById.set(node.id, node);
  };
  const addEdge = (source: string, target: string): void => {
    edges.push(createEdge(slug, source, target));
  };
  const registerChild = (parentId: string): number => {
    const index = childCountsByParent.get(parentId) ?? 0;
    childCountsByParent.set(parentId, index + 1);
    return index;
  };

  addNode(
    createNode(rootId, "overview", { x: 0, y: 320 }, 560, 196, {
      kind: "overview",
      level: 1,
      parentId: null,
      title: summary.title,
      description: summary.description,
      tags: GENERIC_TAGS.overview,
      role: copy.role,
      date: summary.meta,
    })
  );

  const defaultCategories = [
    {
      key: "background",
      id: `${slug}-background`,
      kind: "overview",
      position: { x: 760, y: 120 },
      data: {
        kind: "overview",
        level: 2,
        parentId: rootId,
        categoryKey: "background",
        title: zhEn("项目背景", "Project background"),
        description: summary.description,
        tags: GENERIC_TAGS.overview,
        role: copy.role,
        date: summary.meta,
      },
    },
    {
      key: "space-plan",
      id: `${slug}-space-plan`,
      kind: "plan",
      position: { x: 760, y: 320 },
      data: {
        kind: "plan",
        level: 2,
        parentId: rootId,
        categoryKey: "space-plan",
        title: zhEn("空间方案", "Space plan"),
        description: zhEn(
          "围绕动线、功能分区和空间层级展开方案推导。",
          "Develop the scheme around circulation, zoning, and spatial hierarchy."
        ),
        tags: GENERIC_TAGS.plan,
      },
    },
    {
      key: "visual",
      id: `${slug}-visual`,
      kind: "render",
      position: { x: 760, y: 520 },
      data: {
        kind: "render",
        level: 2,
        parentId: rootId,
        categoryKey: "visual",
        title: zhEn("视觉呈现", "Visual presentation"),
        description: zhEn(
          "通过关键视角、材料气质和画面节奏确认最终表达。",
          "Lock the final expression through key views, material tone, and pacing."
        ),
        tags: GENERIC_TAGS.render,
        image: summary.image,
      },
    },
    {
      key: "procurement",
      id: `${slug}-procurement`,
      kind: "note",
      position: { x: 760, y: 720 },
      data: {
        kind: "note",
        level: 2,
        parentId: rootId,
        categoryKey: "procurement",
        title: zhEn("采购方案", "Procurement Plan"),
        description: zhEn(
          "整理施工限制、沟通反馈与现场协调要点。",
          "Collect construction constraints, feedback, and site coordination notes."
        ),
        tags: GENERIC_TAGS.note,
      },
    },
    {
      key: "result",
      id: `${slug}-result`,
      kind: "final",
      position: { x: 760, y: 920 },
      data: {
        kind: "final",
        level: 2,
        parentId: rootId,
        categoryKey: "result",
        title: zhEn("项目成果", "Project result"),
        description: zhEn(
          "将图纸、效果图和说明整合成最终交付内容。",
          "Package drawings, imagery, and notes into the final deliverable."
        ),
        tags: GENERIC_TAGS.final,
        role: copy.role,
        date: summary.meta,
      },
    },
  ] satisfies ReadonlyArray<{
    key: DefaultProjectCanvasCategoryKey;
    id: string;
    kind: CanvasNodeKind;
    position: { x: number; y: number };
    data: CanvasNodeData;
  }>;
  const defaultCategoryKeys = new Set<string>(
    defaultCategories.map((category) => category.key)
  );

  defaultCategories.forEach((category) => {
    const draftCategory = draftCategories[category.key];

    addNode(
      createNode(
        category.id,
        category.kind,
        draftCategory?.position ?? category.position,
        332,
        116,
        applyDraftCategoryData(category.data, draftCategory)
      )
    );
    registerChild(rootId);
    addEdge(rootId, category.id);
  });

  const draftEntries = Object.entries(draftCategories).filter(
    ([categoryKey, category]) =>
      !defaultCategoryKeys.has(categoryKey) &&
      Boolean(
        category.title ||
        category.description ||
        category.images?.length ||
        category.textAlign ||
        category.textColor ||
        category.fontSize
      )
  );
  const draftEntriesByKey = new Map(draftEntries);
  const createdDraftKeys = new Set<string>();
  const resolveParentId = (parentId: string | undefined): string => {
    if (!parentId) return rootId;
    if (nodesById.has(parentId)) return parentId;
    if (draftEntriesByKey.has(parentId)) return `${slug}-${parentId}`;
    return parentId.startsWith(`${slug}-`) ? parentId : `${slug}-${parentId}`;
  };
  const createDraftCategoryNode = (categoryKey: string): void => {
    if (createdDraftKeys.has(categoryKey)) return;

    const category = draftEntriesByKey.get(categoryKey);
    if (!category) return;

    const requestedParentId = resolveParentId(category.parentId);
    const parentKey = requestedParentId.startsWith(`${slug}-`)
      ? requestedParentId.slice(slug.length + 1)
      : requestedParentId;

    if (!nodesById.has(requestedParentId) && draftEntriesByKey.has(parentKey)) {
      createDraftCategoryNode(parentKey);
    }

    const parentId = nodesById.has(requestedParentId)
      ? requestedParentId
      : rootId;
    const parent = nodesById.get(parentId) ?? nodesById.get(rootId)!;
    const siblingIndex = registerChild(parentId);
    const position =
      category.position ??
      (parentId === rootId
        ? { x: 760, y: 1120 + Math.max(0, siblingIndex - 5) * 200 }
        : {
            x: parent.position.x + 420,
            y: parent.position.y + siblingIndex * 170 - 80,
          });
    const data = applyDraftCategoryData(
      {
        kind: "note",
        level: parent.data.level + 1,
        parentId,
        categoryKey,
        title: zhEn(categoryKey),
        description: zhEn(""),
        tags: GENERIC_TAGS.note,
      },
      category
    );
    const node = createNode(
      `${slug}-${categoryKey}`,
      "note",
      position,
      332,
      data.description.zh ? 148 : 116,
      data
    );

    addNode(node);
    addEdge(parentId, node.id);
    createdDraftKeys.add(categoryKey);
  };

  draftEntries.forEach(([categoryKey]) => createDraftCategoryNode(categoryKey));

  const galleryNodes = nodes
    .filter((node) => node.data.kind !== "image" && node.data.categoryKey)
    .flatMap((node) =>
      createCategoryGalleryNodes({
        parentId: node.id,
        categoryKey: node.data.categoryKey!,
        level: node.data.level + 1,
        anchorPosition: node.position,
        images: getMergedGalleryImages({
          slug,
          categoryKey: node.data.categoryKey!,
          copy,
          draftCategory: draftCategories[node.data.categoryKey!],
        }),
      })
    );

  return {
    slug,
    title: summary.title,
    subtitle: copy.subtitle,
    meta: {
      time: summary.meta,
      type: summary.iconLabel,
      role: copy.role,
    },
    nodes: [...nodes, ...galleryNodes],
    edges,
  };
}

const [loom, atlas, rhythm, groove, fieldnote, talkback] =
  siteContent.homeProjects.items;

export const projectCanvases: ReadonlyArray<ProjectCanvas> = [
  _createProjectCanvas(loom, {
    subtitle: zhEn("活动叙事 / 视觉展开", "Event narrative / visual expansion"),
    role: zhEn(
      "方案、空间效果、道具协同",
      "Concept, spatial visuals, prop coordination"
    ),
    researchNote: zhEn(
      "先锁定开场叙事、传播重点和现场节奏，避免后续来回返工。",
      "Lock the opening story, communication beats, and site rhythm early to avoid rework later."
    ),
    constraintNote: zhEn(
      "活动现场的改动成本很高，所以流程要尽量在前期讲清楚。",
      "Changes on site are expensive, so the workflow needs to be clear early."
    ),
  }),
  _createProjectCanvas(atlas, {
    subtitle: zhEn("展厅空间 / 品牌体验", "Showroom space / brand experience"),
    role: zhEn(
      "平面、立面、建模与效果",
      "Plan, elevation, modeling, and visualization"
    ),
    researchNote: zhEn(
      "先梳理接待路径、展示界面和材质分区，再进入立面表达。",
      "First clarify the reception path, display surfaces, and material zones before detailing."
    ),
    constraintNote: zhEn(
      "需要兼顾品牌识别和现场施工，不能只在图里好看。",
      "The project has to work for both brand recognition and site buildability."
    ),
  }),
  _createProjectCanvas(rhythm, {
    subtitle: zhEn("纪念空间 / 沉浸参观", "Memorial space / immersive visit"),
    role: zhEn(
      "概念、落地与视觉验证",
      "Concept, execution, and visual validation"
    ),
    researchNote: zhEn(
      "把纪念性的动线、视线停顿点和观展情绪先理顺。",
      "Sort out the commemorative circulation, pauses, and viewing mood first."
    ),
    constraintNote: zhEn(
      "在有限面积里保留呼吸感，是整个方案的关键。",
      "Keeping the space breathable inside a tight footprint is the key challenge."
    ),
  }),
  _createProjectCanvas(groove, {
    subtitle: zhEn("展台系统 / 快速搭建", "Booth system / fast build"),
    role: zhEn(
      "规划、深化与现场对接",
      "Planning, detailing, and site coordination"
    ),
    researchNote: zhEn(
      "把装配逻辑、视线高度和运输条件提前纳入方案。",
      "Bring assembly logic, sightlines, and transport constraints into the concept early."
    ),
    constraintNote: zhEn(
      "展台需要快速搭建、快速拆解，还要便于复用。",
      "The booth has to go up fast, come down fast, and remain reusable."
    ),
  }),
  _createProjectCanvas(fieldnote, {
    subtitle: zhEn(
      "研究系统 / 资料组织",
      "Research system / information organization"
    ),
    role: zhEn(
      "信息结构、标签体系、呈现",
      "Information structure, tagging, and presentation"
    ),
    researchNote: zhEn(
      "把访谈、标签和洞察组织成可回看的信息块。",
      "Organize interviews, tags, and insights into reusable information blocks."
    ),
    constraintNote: zhEn(
      "重点不是页面层数，而是后续能不能继续组织思路。",
      "The point is not page depth, but whether thoughts stay reusable after the session."
    ),
  }),
  _createProjectCanvas(talkback, {
    subtitle: zhEn(
      "对话界面 / 交互表达",
      "Conversation UI / interaction expression"
    ),
    role: zhEn(
      "界面结构、信息节奏、视觉",
      "Layout, information rhythm, and visuals"
    ),
    researchNote: zhEn(
      "先拆掉生硬的终端感，再补上更自然的对话节奏。",
      "First remove the terminal feeling, then rebuild a more natural rhythm."
    ),
    constraintNote: zhEn(
      "要在简洁和亲和之间保持平衡，不能一味做轻。",
      "The interface has to stay balanced between clarity and warmth."
    ),
  }),
] as const;

export function getProjectCanvas(slug: string): ProjectCanvas | undefined {
  return projectCanvases.find((project) => project.slug === slug);
}
