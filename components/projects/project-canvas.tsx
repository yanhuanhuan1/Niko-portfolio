"use client";

import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ArrowShapeArrowheadEndStyle,
  ArrowShapeArrowheadStartStyle,
  ArrowShapeKindStyle,
  DefaultColorStyle,
  DefaultDashStyle,
  DefaultFillStyle,
  DefaultFontStyle,
  DefaultSizeStyle,
  type TLComponents,
  type Editor,
  Tldraw,
  useEditor,
  useValue,
} from "tldraw";
import "tldraw/tldraw.css";

import { useLanguage } from "@/lib/language";
import type { ProjectCanvas } from "@/data/projectCanvases";

import { createProjectCanvasSnapshot } from "./project-canvas-snapshot";
import styles from "./project-canvas.module.css";

type ProjectCanvasProps = {
  project: ProjectCanvas;
};

type ConnectorHandle = {
  id: string;
  x: number;
  y: number;
};

function getThemeColorScheme(
  resolvedTheme: string | undefined
): "light" | "dark" | null {
  if (resolvedTheme === "light" || resolvedTheme === "dark") {
    return resolvedTheme;
  }

  if (typeof document !== "undefined") {
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  }

  return null;
}

function syncEditorColorScheme(editor: Editor, resolvedTheme: string | undefined) {
  const colorScheme = getThemeColorScheme(resolvedTheme);
  if (!colorScheme) return;

  editor.user.updateUserPreferences({ colorScheme });
}

function syncProjectCanvasDefaults(editor: Editor) {
  editor.setStyleForNextShapes(ArrowShapeKindStyle, "arc");
  editor.setStyleForNextShapes(ArrowShapeArrowheadStartStyle, "none");
  editor.setStyleForNextShapes(ArrowShapeArrowheadEndStyle, "none");
  editor.setStyleForNextShapes(DefaultColorStyle, "blue");
  editor.setStyleForNextShapes(DefaultDashStyle, "solid");
  editor.setStyleForNextShapes(DefaultFillStyle, "semi");
  editor.setStyleForNextShapes(DefaultFontStyle, "sans");
  editor.setStyleForNextShapes(DefaultSizeStyle, "xl");
}

function ProjectCanvasConnectorHandles() {
  const editor = useEditor();
  const handles = useValue(
    "project canvas connector handles",
    () => {
      editor.getCamera();

      return editor.getCurrentPageShapes().flatMap((shape): ConnectorHandle[] => {
        const meta = shape.meta as {
          niko?: {
            kind?: string;
          };
        };

        if (shape.type !== "geo" || meta.niko?.kind !== "project-node") {
          return [];
        }

        const bounds = editor.getShapePageBounds(shape);
        if (!bounds) return [];

        const left = editor.pageToViewport({
          x: bounds.x,
          y: bounds.y + bounds.h / 2,
        });
        const right = editor.pageToViewport({
          x: bounds.x + bounds.w,
          y: bounds.y + bounds.h / 2,
        });

        return [
          { id: `${shape.id}-left`, x: left.x, y: left.y },
          { id: `${shape.id}-right`, x: right.x, y: right.y },
        ];
      });
    },
    [editor]
  );

  return (
    <div className={styles.connectorHandleLayer} aria-hidden="true">
      {handles.map((handle) => (
        <span
          key={handle.id}
          className={styles.connectorHandle}
          style={{
            transform: `translate(${handle.x}px, ${handle.y}px)`,
          }}
        />
      ))}
    </div>
  );
}

export function ProjectCanvas({ project }: ProjectCanvasProps) {
  const { language } = useLanguage();
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<Editor | null>(null);

  const snapshot = useMemo(
    () => createProjectCanvasSnapshot(project, language),
    [language, project]
  );
  const components = useMemo<TLComponents>(
    () => ({
      InFrontOfTheCanvas: ProjectCanvasConnectorHandles,
    }),
    []
  );

  useEffect(() => {
    if (!editorRef.current) return;
    syncEditorColorScheme(editorRef.current, resolvedTheme);
  }, [resolvedTheme]);

  const handleMount = useCallback(
    (editor: Editor) => {
      editorRef.current = editor;
      syncEditorColorScheme(editor, resolvedTheme);
      syncProjectCanvasDefaults(editor);
    },
    [resolvedTheme]
  );

  return (
    <div className={styles.tldrawHost}>
      <Tldraw
        snapshot={snapshot}
        persistenceKey={`niko-project-canvas-v2-${project.slug}-${language}`}
        components={components}
        locale={language === "zh" ? "zh-cn" : "en"}
        onMount={handleMount}
      />
    </div>
  );
}
