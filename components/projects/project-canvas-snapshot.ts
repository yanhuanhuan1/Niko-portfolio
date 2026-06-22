"use client";

import {
  AssetRecordType,
  Editor,
  createShapeId,
  createTLStore,
  defaultAssetUtils,
  defaultBindingUtils,
  defaultAddFontsFromNode,
  defaultShapeUtils,
  toRichText,
  tipTapDefaultExtensions,
  type TLAnyAssetUtilConstructor,
  type TLAnyBindingUtilConstructor,
  type TLAnyShapeUtilConstructor,
  type TLArrowBindingProps,
  type TLArrowShapeArrowheadStyle,
  type TLArrowShapeKind,
  type TLDefaultColorStyle,
  type TLDefaultDashStyle,
  type TLDefaultFillStyle,
  type TLDefaultFontStyle,
  type TLDefaultHorizontalAlignStyle,
  type TLDefaultSizeStyle,
  type TLEditorSnapshot,
} from "tldraw";

import { t } from "@/content/site-content";
import type {
  CanvasGalleryImage,
  ProjectCanvas,
} from "@/data/projectCanvases";

type CanvasNode = ProjectCanvas["nodes"][number];
type CanvasEdge = ProjectCanvas["edges"][number];
type CanvasConnectorTerminal = CanvasEdge["connector"]["start"];

type SeedShapeBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type CameraSnapshot = {
  x: number;
  y: number;
  z: number;
};

const SNAPSHOT_VIEWPORT_PADDING = 48;
const SNAPSHOT_CONTENT_PADDING = 96;
const FALLBACK_VIEWPORT_SIZE = {
  width: 1600,
  height: 1000,
};
const SHAPE_UTILS = defaultShapeUtils as unknown as readonly TLAnyShapeUtilConstructor[];
const BINDING_UTILS = defaultBindingUtils as unknown as readonly TLAnyBindingUtilConstructor[];
const ASSET_UTILS = defaultAssetUtils as unknown as readonly TLAnyAssetUtilConstructor[];
const TEXT_OPTIONS = {
  addFontsFromNode: defaultAddFontsFromNode,
  tipTapConfig: {
    extensions: tipTapDefaultExtensions,
  },
};
const NODE_COLOR = "blue" satisfies TLDefaultColorStyle;
const ROOT_NODE_FILL = "semi" satisfies TLDefaultFillStyle;
const CHILD_NODE_FILL = "none" satisfies TLDefaultFillStyle;
const NODE_DASH = "solid" satisfies TLDefaultDashStyle;
const NODE_FONT = "sans" satisfies TLDefaultFontStyle;
const ROOT_NODE_SIZE = "xl" satisfies TLDefaultSizeStyle;
const CHILD_NODE_SIZE = "l" satisfies TLDefaultSizeStyle;
const ROOT_NODE_LABEL_COLOR = "black" satisfies TLDefaultColorStyle;
const CHILD_NODE_LABEL_COLOR = "grey" satisfies TLDefaultColorStyle;

type SnapshotStore = ReturnType<typeof createTLStore> & {
  ensureStoreIsUsable?: () => void;
};

function toNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return fallback;
}

function getNodeSize(node: CanvasNode): { width: number; height: number } {
  return {
    width: toNumber(node.width ?? node.style?.width, 320),
    height: toNumber(node.height ?? node.style?.height, 120),
  };
}

function getText(node: CanvasNode, language: "zh" | "en"): string {
  return t(node.data.title, language);
}

function getCanvasImage(node: CanvasNode): CanvasGalleryImage | null {
  if (node.data.gallery?.length) {
    return node.data.gallery[node.data.galleryIndex ?? 0] ?? node.data.gallery[0] ?? null;
  }

  if (node.data.image) {
    const width = toNumber(node.width ?? node.style?.width, 1200);
    const height = toNumber(node.height ?? node.style?.height, 900);
    const image: CanvasGalleryImage = {
      src: node.data.image.src,
      thumbnailSrc: node.data.image.src,
      alt: node.data.image.alt,
      width,
      height,
    };

    if (width > 0 && height > 0) {
      image.aspectRatio = width / height;
    }

    return image;
  }

  return null;
}

function guessMimeType(src: string): string {
  const lower = src.toLowerCase();

  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".svg")) return "image/svg+xml";

  return "image/jpeg";
}

function getStableHash(input: string): string {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

function createNodeRichText(node: CanvasNode, language: "zh" | "en"): string {
  const title = getText(node, language).trim();
  return title || "Untitled";
}

function getNodeHorizontalAlign(
  node: CanvasNode
): TLDefaultHorizontalAlignStyle {
  switch (node.data.textAlign) {
    case "left":
      return "start";
    case "right":
      return "end";
    default:
      return "middle";
  }
}

function mergeBounds(
  current: SeedShapeBounds | null,
  next: SeedShapeBounds
): SeedShapeBounds {
  if (!current) {
    return { ...next };
  }

  const minX = Math.min(current.x, next.x);
  const minY = Math.min(current.y, next.y);
  const maxX = Math.max(current.x + current.width, next.x + next.width);
  const maxY = Math.max(current.y + current.height, next.y + next.height);

  return {
    x: minX,
    y: minY,
    width: Math.max(maxX - minX, 1),
    height: Math.max(maxY - minY, 1),
  };
}

function inflateBounds(bounds: SeedShapeBounds, padding: number): SeedShapeBounds {
  return {
    x: bounds.x - padding,
    y: bounds.y - padding,
    width: bounds.width + padding * 2,
    height: bounds.height + padding * 2,
  };
}

function getArrowBend(
  start: { x: number; y: number },
  end: { x: number; y: number }
): number {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const distance = Math.hypot(deltaX, deltaY);

  if (!Number.isFinite(distance) || distance < 1) {
    return 0;
  }

  const primaryAxisDelta = Math.abs(deltaX) >= Math.abs(deltaY) ? deltaY : deltaX;
  if (primaryAxisDelta === 0) {
    return 0;
  }

  const bendMagnitude = Math.max(24, Math.min(120, distance * 0.18));
  return Math.sign(primaryAxisDelta) * bendMagnitude;
}

function getAnchorPagePoint(
  bounds: SeedShapeBounds,
  terminal: CanvasConnectorTerminal
): { x: number; y: number } {
  return {
    x: bounds.x + bounds.width * terminal.normalizedAnchor.x,
    y: bounds.y + bounds.height * terminal.normalizedAnchor.y,
  };
}

function createArrowBindingProps(
  terminal: "start" | "end",
  connectorTerminal: CanvasConnectorTerminal
): TLArrowBindingProps {
  return {
    terminal,
    normalizedAnchor: connectorTerminal.normalizedAnchor,
    isExact: connectorTerminal.isExact,
    isPrecise: connectorTerminal.isPrecise,
    snap: connectorTerminal.snap,
  };
}

function getArrowShapeStyle(edge: CanvasEdge): {
  kind: TLArrowShapeKind;
  color: TLDefaultColorStyle;
  dash: TLDefaultDashStyle;
  size: TLDefaultSizeStyle;
  arrowheadStart: TLArrowShapeArrowheadStyle;
  arrowheadEnd: TLArrowShapeArrowheadStyle;
  elbowMidPoint: number;
} {
  return {
    kind: edge.connector.kind,
    color: edge.connector.color,
    dash: edge.connector.dash,
    size: edge.connector.size,
    arrowheadStart: edge.connector.arrowheadStart,
    arrowheadEnd: edge.connector.arrowheadEnd,
    elbowMidPoint: edge.connector.elbowMidPoint ?? 0.5,
  };
}

function buildSessionSnapshot(
  editor: Editor,
  camera: CameraSnapshot
): TLEditorSnapshot["session"] {
  const instanceState = editor.getInstanceState();
  const currentPageState = editor.getCurrentPageState();

  return {
    version: 0,
    currentPageId: instanceState.currentPageId,
    exportBackground: instanceState.exportBackground,
    isDebugMode: instanceState.isDebugMode,
    isFocusMode: instanceState.isFocusMode,
    isToolLocked: instanceState.isToolLocked,
    isGridMode: instanceState.isGridMode,
    pageStates: [
      {
        pageId: currentPageState.pageId,
        camera: {
          x: camera.x,
          y: camera.y,
          z: camera.z,
        },
        selectedShapeIds: [...currentPageState.selectedShapeIds],
        focusedGroupId: currentPageState.focusedGroupId ?? null,
      },
    ],
  };
}

function getSnapshotViewportSize(): { width: number; height: number } {
  if (typeof window === "undefined") {
    return FALLBACK_VIEWPORT_SIZE;
  }

  return {
    width: Math.max(window.innerWidth - SNAPSHOT_VIEWPORT_PADDING * 2, 1),
    height: Math.max(window.innerHeight - SNAPSHOT_VIEWPORT_PADDING * 2, 1),
  };
}

function getCameraForBounds(
  bounds: SeedShapeBounds | null,
  viewport: { width: number; height: number }
): CameraSnapshot {
  if (!bounds) {
    return {
      x: viewport.width / 2,
      y: viewport.height / 2,
      z: 1,
    };
  }

  const zoomX = viewport.width / Math.max(bounds.width, 1);
  const zoomY = viewport.height / Math.max(bounds.height, 1);
  const zoom = Math.max(Math.min(zoomX, zoomY), 0.1);
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;

  return {
    x: viewport.width / 2 - centerX * zoom,
    y: viewport.height / 2 - centerY * zoom,
    z: zoom,
  };
}

export function createProjectCanvasSnapshot(
  project: ProjectCanvas,
  language: "zh" | "en"
): TLEditorSnapshot {
  const store = createTLStore({
    shapeUtils: SHAPE_UTILS,
    bindingUtils: BINDING_UTILS,
    assetUtils: ASSET_UTILS,
  }) as SnapshotStore;
  store.ensureStoreIsUsable?.();

  const editor = new Editor({
    store,
    shapeUtils: SHAPE_UTILS,
    bindingUtils: BINDING_UTILS,
    assetUtils: ASSET_UTILS,
    textOptions: TEXT_OPTIONS,
    tools: [],
    getContainer: () => document.createElement("div"),
    autoFocus: false,
  });

  const viewport = getSnapshotViewportSize();
  let contentBounds: SeedShapeBounds | null = null;

  editor.run(() => {
    const shapeIdByNodeId = new Map<string, ReturnType<typeof createShapeId>>();
    const boundsByNodeId = new Map<string, SeedShapeBounds>();
    const assetIdBySource = new Map<
      string,
      ReturnType<typeof AssetRecordType.createId>
    >();

    for (const node of project.nodes) {
      const shapeId: ReturnType<typeof createShapeId> = createShapeId(
        `${project.slug}-${node.id}`
      );
      shapeIdByNodeId.set(node.id, shapeId);

      const size = getNodeSize(node);
      const bounds: SeedShapeBounds = {
        x: node.position.x,
        y: node.position.y,
        width: size.width,
        height: size.height,
      };

      boundsByNodeId.set(node.id, bounds);
      contentBounds = mergeBounds(contentBounds, bounds);

      const image = getCanvasImage(node);

      if (image) {
        const source = image.thumbnailSrc || image.src;
        let assetId = assetIdBySource.get(source);

        if (!assetId) {
          assetId = AssetRecordType.createId(
            getStableHash(source)
          ) as ReturnType<typeof AssetRecordType.createId>;
          assetIdBySource.set(source, assetId);
          editor.createAssets([
            AssetRecordType.create({
              id: assetId,
              type: "image",
              props: {
                w: image.width ?? size.width,
                h: image.height ?? size.height,
                mimeType: guessMimeType(source),
                src: source,
                name: image.caption ?? getText(node, language),
                isAnimated: false,
              },
            }),
          ]);
        }

        editor.createShape({
          id: shapeId,
          type: "image",
          x: bounds.x,
          y: bounds.y,
          meta: {
            niko: {
              kind: "project-node",
              nodeId: node.id,
              level: node.data.level,
            },
          },
          props: {
            w: size.width,
            h: size.height,
            assetId,
          },
        });
        continue;
      }

      editor.createShape({
        id: shapeId,
        type: "geo",
        x: bounds.x,
        y: bounds.y,
        meta: {
          niko: {
            kind: "project-node",
            nodeId: node.id,
            level: node.data.level,
          },
        },
        props: {
          w: size.width,
          h: size.height,
          geo: "rectangle",
          color: NODE_COLOR,
          fill: node.data.level <= 1 ? ROOT_NODE_FILL : CHILD_NODE_FILL,
          dash: NODE_DASH,
          size: node.data.level <= 1 ? ROOT_NODE_SIZE : CHILD_NODE_SIZE,
          font: NODE_FONT,
          align: getNodeHorizontalAlign(node),
          verticalAlign: "middle",
          labelColor:
            node.data.level <= 1 ? ROOT_NODE_LABEL_COLOR : CHILD_NODE_LABEL_COLOR,
          richText: toRichText(createNodeRichText(node, language)),
        },
      });
    }

    for (const edge of project.edges) {
      const sourceShapeId = shapeIdByNodeId.get(edge.source);
      const targetShapeId = shapeIdByNodeId.get(edge.target);
      const sourceBounds = boundsByNodeId.get(edge.source);
      const targetBounds = boundsByNodeId.get(edge.target);

      if (
        !sourceShapeId ||
        !targetShapeId ||
        !sourceBounds ||
        !targetBounds
      ) {
        continue;
      }

      const arrowId: ReturnType<typeof createShapeId> = createShapeId(
        `${project.slug}-${edge.id}`
      );
      const startPoint = getAnchorPagePoint(sourceBounds, edge.connector.start);
      const endPoint = getAnchorPagePoint(targetBounds, edge.connector.end);
      const arrowOrigin = {
        x: Math.min(startPoint.x, endPoint.x),
        y: Math.min(startPoint.y, endPoint.y),
      };
      const bend = edge.connector.bend ?? getArrowBend(startPoint, endPoint);
      const arrowStyle = getArrowShapeStyle(edge);

      editor.createShape({
        id: arrowId,
        type: "arrow",
        x: arrowOrigin.x,
        y: arrowOrigin.y,
        meta: {
          niko: {
            kind: "project-connector",
            edgeId: edge.id,
            sourceNodeId: edge.source,
            targetNodeId: edge.target,
          },
        },
        props: {
          ...arrowStyle,
          fill: "none",
          start: {
            x: startPoint.x - arrowOrigin.x,
            y: startPoint.y - arrowOrigin.y,
          },
          end: {
            x: endPoint.x - arrowOrigin.x,
            y: endPoint.y - arrowOrigin.y,
          },
          bend,
        },
      });

      editor.createBindings([
        {
          fromId: arrowId,
          toId: sourceShapeId,
          type: "arrow",
          props: createArrowBindingProps("start", edge.connector.start),
        },
        {
          fromId: arrowId,
          toId: targetShapeId,
          type: "arrow",
          props: createArrowBindingProps("end", edge.connector.end),
        },
      ]);
    }
  });
  const camera = getCameraForBounds(
    contentBounds ? inflateBounds(contentBounds, SNAPSHOT_CONTENT_PADDING) : null,
    viewport
  );

  return {
    document: store.getStoreSnapshot(),
    session: buildSessionSnapshot(editor, camera),
  };
}
