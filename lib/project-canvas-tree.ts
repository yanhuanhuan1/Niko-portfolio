import type { Edge, Node } from "@xyflow/react";

import type { CanvasNodeData } from "@/data/projectCanvases";

export type CanvasFlowNode = Node<CanvasNodeData>;

export type CanvasRuntimeNodeData = CanvasNodeData & {
  hasChildren: boolean;
  isExpanded: boolean;
  onToggleExpansion: (() => void) | undefined;
  onCreateChildTheme?: (files?: File[]) => void;
  onUploadFiles?: (files: File[]) => void;
  editing?: boolean;
  onCommitRename?: (title: string) => void;
  onCancelRename?: () => void;
};

export type CanvasRuntimeFlowNode = Node<CanvasRuntimeNodeData>;

export type CanvasHierarchy = {
  nodesById: ReadonlyMap<string, CanvasFlowNode>;
  childrenByParentId: ReadonlyMap<string, ReadonlyArray<string>>;
  rootIds: ReadonlyArray<string>;
};

export function isDefaultExpanded(level: number): boolean {
  return level <= 2;
}

export function buildCanvasHierarchy(
  nodes: ReadonlyArray<CanvasFlowNode>
): CanvasHierarchy {
  const nodesById = new Map<string, CanvasFlowNode>();
  const childrenByParentId = new Map<string, string[]>();
  const rootIds: string[] = [];

  for (const node of nodes) {
    nodesById.set(node.id, node);
  }

  for (const node of nodes) {
    const parentId = node.data.parentId;

    if (parentId && nodesById.has(parentId)) {
      const children = childrenByParentId.get(parentId) ?? [];
      children.push(node.id);
      childrenByParentId.set(parentId, children);
      continue;
    }

    rootIds.push(node.id);
  }

  return {
    nodesById,
    childrenByParentId,
    rootIds,
  };
}

export function hasChildren(
  nodeId: string,
  hierarchy: CanvasHierarchy
): boolean {
  return (hierarchy.childrenByParentId.get(nodeId)?.length ?? 0) > 0;
}

export function createDefaultExpandedState(
  hierarchy: CanvasHierarchy
): Record<string, boolean> {
  const expandedState: Record<string, boolean> = {};

  for (const [nodeId, node] of hierarchy.nodesById.entries()) {
    if (hasChildren(nodeId, hierarchy)) {
      expandedState[nodeId] = isDefaultExpanded(node.data.level);
    }
  }

  return expandedState;
}

export function isNodeExpanded(
  nodeId: string,
  hierarchy: CanvasHierarchy,
  expandedState: Record<string, boolean>
): boolean {
  const node = hierarchy.nodesById.get(nodeId);

  if (!node || !hasChildren(nodeId, hierarchy)) {
    return false;
  }

  return expandedState[nodeId] ?? isDefaultExpanded(node.data.level);
}

export function getVisibleNodeIds(
  hierarchy: CanvasHierarchy,
  expandedState: Record<string, boolean>
): Set<string> {
  const visibleNodeIds = new Set<string>();

  const visit = (nodeId: string): void => {
    if (visibleNodeIds.has(nodeId)) {
      return;
    }

    const node = hierarchy.nodesById.get(nodeId);
    if (!node) {
      return;
    }

    visibleNodeIds.add(nodeId);

    if (!isNodeExpanded(nodeId, hierarchy, expandedState)) {
      return;
    }

    const childIds = hierarchy.childrenByParentId.get(nodeId) ?? [];
    for (const childId of childIds) {
      visit(childId);
    }
  };

  for (const rootId of hierarchy.rootIds) {
    visit(rootId);
  }

  return visibleNodeIds;
}

export function getVisibleEdges(
  edges: ReadonlyArray<Edge>,
  visibleNodeIds: ReadonlySet<string>
): Edge[] {
  return edges.map((edge) => ({
    ...edge,
    hidden:
      !visibleNodeIds.has(edge.source) || !visibleNodeIds.has(edge.target),
  }));
}

export function isDescendantOf(
  nodeId: string,
  ancestorId: string,
  hierarchy: CanvasHierarchy
): boolean {
  let currentId = hierarchy.nodesById.get(nodeId)?.data.parentId ?? null;

  while (currentId) {
    if (currentId === ancestorId) {
      return true;
    }

    currentId = hierarchy.nodesById.get(currentId)?.data.parentId ?? null;
  }

  return false;
}
