import { siteContent } from "@/content/site-content";

const PROJECTS = siteContent.homeProjects.items;

export type ProjectItem = (typeof PROJECTS)[number];

export function orderProjects(
  order: readonly ProjectItem["id"][]
): readonly ProjectItem[] {
  const projectById = new Map(PROJECTS.map((project) => [project.id, project]));

  return order
    .map((id) => projectById.get(id))
    .filter((project): project is ProjectItem => project !== undefined);
}
