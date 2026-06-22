"use client";

import {
  AssetRecordType,
  type Editor,
  Tldraw,
  createShapeId,
  toRichText,
} from "tldraw";
import "tldraw/tldraw.css";
import { useCallback, useRef } from "react";

import { t } from "@/content/site-content";
import { useLanguage } from "@/lib/language";
import type {
  CanvasGalleryImage,
  ProjectCanvas,
} from "@/data/projectCanvases";

import styles from "./project-canvas.module.css";

type ProjectCanvasProps = {
  project: ProjectCanvas;
};

type CanvasNode = ProjectCanvas["nodes"][number];

type SeedShapeBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ArrowPlacement = {
  start: { x: number; y: number };
  end: { x: number; y: number };
  startAnchor: { x: number; y: number };
  endAnchor: { x: number; y: number };
};

type LegacyGeoStyleUpdate = {
  id: string;
  type: "geo";
  props: {
    color: "black";
    labelColor: "black";
    fill: "none";
    dash: "draw";
    size: "m";
    font: "draw";
    align: "middle";
    verticalAlign: "middle";
  };
};

type LegacyArrowStyleUpdate = {
  id: string;
  type: "arrow";
  props: {
    kind: "arc";
    dash: "draw";
    size: "m";
    fill: "none";
    color: "black";
    labelColor: "black";
    bend: number;
    arrowheadStart: "none";
    arrowheadEnd: "arrow";
    font: "draw";
  };
};

type LegacyStyleUpdate = LegacyGeoStyleUpdate | LegacyArrowStyleUpdate;

const CANVAS_STYLE_MIGRATION_VERSION = "4";
const CANVAS_STYLE_MIGRATION_META_KEY = "nikoCanvasStyleVersion";

function CanvasBackground() {
  return <div className={styles.tldrawBackground} />;
}

const canvasComponents = {
  Background: CanvasBackground,
  Grid: () => null,
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

function getArrowPlacement(
  source: SeedShapeBounds,
  target: SeedShapeBounds
): ArrowPlacement {
  const sourceCenter = {
    x: source.x + source.width / 2,
    y: source.y + source.height / 2,
  };
  const targetCenter = {
    x: target.x + target.width / 2,
    y: target.y + target.height / 2,
  };
  const deltaX = targetCenter.x - sourceCenter.x;
  const deltaY = targetCenter.y - sourceCenter.y;
  const horizontal = Math.abs(deltaX) >= Math.abs(deltaY);

  if (horizontal) {
    const sourceOnLeft = deltaX >= 0;

    return {
      start: {
        x: sourceOnLeft ? source.x + source.width + 12 : source.x - 12,
        y: sourceCenter.y,
      },
      end: {
        x: sourceOnLeft ? target.x - 12 : target.x + target.width + 12,
        y: targetCenter.y,
      },
      startAnchor: sourceOnLeft ? { x: 1, y: 0.5 } : { x: 0, y: 0.5 },
      endAnchor: sourceOnLeft ? { x: 0, y: 0.5 } : { x: 1, y: 0.5 },
    };
  }

  const sourceOnTop = deltaY >= 0;

  return {
    start: {
      x: sourceCenter.x,
      y: sourceOnTop ? source.y + source.height + 12 : source.y - 12,
    },
    end: {
      x: targetCenter.x,
      y: sourceOnTop ? target.y - 12 : target.y + target.height + 12,
    },
    startAnchor: sourceOnTop ? { x: 0.5, y: 1 } : { x: 0.5, y: 0 },
    endAnchor: sourceOnTop ? { x: 0.5, y: 0 } : { x: 0.5, y: 1 },
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

function createNodeRichText(node: CanvasNode, language: "zh" | "en"): string {
  const title = getText(node, language).trim();
  return title || "Untitled";
}

function getCanvasStyleMigrationVersion(editor: Editor): string | undefined {
  const meta = editor.getDocumentSettings().meta as Record<string, unknown>;
  const value = meta[CANVAS_STYLE_MIGRATION_META_KEY];
  return typeof value === "string" ? value : undefined;
}

function markCanvasStyleMigrationComplete(editor: Editor): void {
  const meta = editor.getDocumentSettings().meta as Record<string, unknown>;
  editor.updateDocumentSettings({
    meta: {
      ...meta,
      [CANVAS_STYLE_MIGRATION_META_KEY]: CANVAS_STYLE_MIGRATION_VERSION,
    },
  });
}

function normalizeSeededCanvasStyles(editor: Editor): boolean {
  const updates: LegacyStyleUpdate[] = [];

  for (const shape of editor.getCurrentPageShapes()) {
    if (shape.type === "geo") {
      const props = shape.props as {
        color?: string;
        fill?: string;
        dash?: string;
        size?: string;
        font?: string;
        align?: string;
        verticalAlign?: string;
        labelColor?: string;
      };

      const isLegacyGeo =
        props.color !== "black" ||
        props.fill !== "none" ||
        props.dash !== "draw" ||
        props.size !== "m" ||
        props.font !== "draw" ||
        props.align !== "middle" ||
        props.verticalAlign !== "middle" ||
        props.labelColor !== "black";

      if (!isLegacyGeo) continue;

      updates.push({
        id: shape.id,
        type: "geo",
        props: {
          color: "black",
          labelColor: "black" as const,
          fill: "none",
          dash: "draw",
          size: "m",
          font: "draw",
          align: "middle",
          verticalAlign: "middle",
        },
      });
      continue;
    }

    if (shape.type === "arrow") {
      const props = shape.props as {
        kind?: string;
        dash?: string;
        size?: string;
        fill?: string;
        color?: string;
        labelColor?: string;
        bend?: number;
        start: { x: number; y: number };
        end: { x: number; y: number };
        arrowheadStart?: string;
        arrowheadEnd?: string;
        font?: string;
      };
      const bend = getArrowBend(props.start, props.end);
      const shouldUpdateBend =
        (typeof props.bend !== "number" || Math.abs(props.bend) < 0.001) && bend !== 0;

      const isLegacyArrow =
        props.kind !== "arc" ||
        props.dash !== "draw" ||
        props.size !== "m" ||
        props.fill !== "none" ||
        props.color !== "black" ||
        props.labelColor !== "black" ||
        shouldUpdateBend ||
        props.arrowheadStart !== "none" ||
        props.arrowheadEnd !== "arrow" ||
        props.font !== "draw";

      if (!isLegacyArrow) continue;

      updates.push({
        id: shape.id,
        type: "arrow",
        props: {
          kind: "arc",
          dash: "draw",
          size: "m",
          fill: "none",
          color: "black",
          labelColor: "black",
          bend,
          arrowheadStart: "none",
          arrowheadEnd: "arrow",
          font: "draw",
        },
      });
    }
  }

  if (!updates.length) return false;

  editor.markHistoryStoppingPoint("normalize seeded canvas styles");
  editor.run(() => {
    editor.updateShapes(updates as never);
  });
  editor.clearHistory();
  return true;
}

function buildSeedData(project: ProjectCanvas, language: "zh" | "en") {
  const assets: Array<{
    id: string;
    typeName: "asset";
    type: "image";
    meta: Record<string, never>;
    props: {
      w: number;
      h: number;
      mimeType: string;
      src: string;
      name: string;
      isAnimated: boolean;
    };
  }> = [];
  const shapes: Array<Record<string, unknown>> = [];
  const bindings: Array<Record<string, unknown>> = [];
  const boundsByNodeId = new Map<string, SeedShapeBounds>();
  const shapeIdByNodeId = new Map<string, string>();
  const assetIdBySrc = new Map<string, string>();

  for (const node of project.nodes) {
    const shapeId = createShapeId(`${project.slug}-${node.id}`);
    shapeIdByNodeId.set(node.id, shapeId);

    const size = getNodeSize(node);
    const bounds: SeedShapeBounds = {
      x: node.position.x,
      y: node.position.y,
      width: size.width,
      height: size.height,
    };
    boundsByNodeId.set(node.id, bounds);

    const image = getCanvasImage(node);

    if (image) {
      const source = image.thumbnailSrc || image.src;
      let assetId = assetIdBySrc.get(source);

      if (!assetId) {
        assetId = AssetRecordType.createId();
        assetIdBySrc.set(source, assetId);
        assets.push({
          id: assetId,
          typeName: "asset",
          type: "image",
          meta: {},
          props: {
            w: image.width ?? size.width,
            h: image.height ?? size.height,
            mimeType: guessMimeType(source),
            src: source,
            name: image.caption ?? getText(node, language),
            isAnimated: false,
          },
        });
      }

      shapes.push({
        id: shapeId,
        type: "image",
        x: bounds.x,
        y: bounds.y,
        props: {
          w: size.width,
          h: size.height,
          assetId,
        },
      });
      continue;
    }

    shapes.push({
      id: shapeId,
      type: "geo",
      x: bounds.x,
      y: bounds.y,
      props: {
        w: size.width,
        h: size.height,
        geo: "rectangle",
        richText: toRichText(createNodeRichText(node, language)),
      },
    });
  }

  for (const edge of project.edges) {
    const sourceBounds = boundsByNodeId.get(edge.source);
    const targetBounds = boundsByNodeId.get(edge.target);
    const sourceShapeId = shapeIdByNodeId.get(edge.source);
    const targetShapeId = shapeIdByNodeId.get(edge.target);

    if (!sourceBounds || !targetBounds || !sourceShapeId || !targetShapeId) {
      continue;
    }

    const placement = getArrowPlacement(sourceBounds, targetBounds);
    const arrowX = Math.min(placement.start.x, placement.end.x);
    const arrowY = Math.min(placement.start.y, placement.end.y);

    const arrowId = createShapeId(`${project.slug}-${edge.id}`);

    shapes.push({
      id: arrowId,
      type: "arrow",
      x: arrowX,
      y: arrowY,
      props: {
        kind: "arc",
        dash: "draw",
        size: "m",
        fill: "none",
        color: "black",
        labelColor: "black",
        bend: getArrowBend(placement.start, placement.end),
        start: {
          x: placement.start.x - arrowX,
          y: placement.start.y - arrowY,
        },
        end: {
          x: placement.end.x - arrowX,
          y: placement.end.y - arrowY,
        },
        arrowheadStart: "none",
        arrowheadEnd: "arrow",
        font: "draw",
      },
    });

    bindings.push(
      {
        fromId: arrowId,
        toId: sourceShapeId,
        type: "arrow",
        props: {
          terminal: "start",
          normalizedAnchor: placement.startAnchor,
          isExact: false,
          isPrecise: true,
        },
      },
      {
        fromId: arrowId,
        toId: targetShapeId,
        type: "arrow",
        props: {
          terminal: "end",
          normalizedAnchor: placement.endAnchor,
          isExact: false,
          isPrecise: true,
        },
      }
    );
  }

  return { assets, bindings, shapes };
}

export function ProjectCanvas({ project }: ProjectCanvasProps) {
  const { language } = useLanguage();
  const seededRef = useRef(false);

  const handleMount = useCallback(
    (editor: Editor) => {
      if (seededRef.current) return;

      const hasExistingShapes = editor.getCurrentPageShapeIds().size > 0;
      const migrationVersion = getCanvasStyleMigrationVersion(editor);
      const needsStyleMigration = migrationVersion !== CANVAS_STYLE_MIGRATION_VERSION;

      if (hasExistingShapes) {
        if (needsStyleMigration) {
          normalizeSeededCanvasStyles(editor);
          markCanvasStyleMigrationComplete(editor);
        }

        seededRef.current = true;
        return;
      }

      const { assets, bindings, shapes } = buildSeedData(project, language);

      editor.markHistoryStoppingPoint(`seed project canvas: ${project.slug}`);
      editor.run(() => {
        if (assets.length) {
          editor.createAssets(assets as never);
        }

        if (shapes.length) {
          editor.createShapes(shapes as never);
        }

        if (bindings.length) {
          editor.createBindings(bindings as never);
        }
      });

      editor.zoomToFit({ animation: { duration: 0 } });
      editor.clearHistory();
      markCanvasStyleMigrationComplete(editor);
      seededRef.current = true;
    },
    [language, project]
  );

  return (
    <div className={styles.tldrawHost}>
      <Tldraw
        persistenceKey={`niko-project-${project.slug}`}
        locale="zh-cn"
        components={canvasComponents}
        onMount={handleMount}
      />
    </div>
  );
}
