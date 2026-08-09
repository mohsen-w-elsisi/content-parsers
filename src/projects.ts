import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";
import { parse as parseYaml } from "yaml";

import type { Parser } from "./parser.js";

const projectEntrySchema = z.object({
  title: z.string(),
  favourite: z.boolean(),
  description: z.string(),
  tags: z.array(z.string()),
  tools: z.array(z.string()),
  links: z.array(
    z.object({
      platform: z.string(),
      url: z.string(),
    }),
  ),
});

type ProjectEntry = z.infer<typeof projectEntrySchema>;

export interface Project extends ProjectEntry {
  id: string;
  details: string;
  resume: string;
  icon?: string;
  thumbnail: string;
  showcaseImages: string[];
}

export class ProjectsParser implements Parser<Project> {
  private readonly rootDir: string;
  private projects: Project[] = [];

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  async parse(): Promise<Project[]> {
    for (const projectDir of await readdir(this.rootDir)) {
      const projectPath = path.join(this.rootDir, projectDir);
      const project = await new ProjectEntryParser(projectPath).parse();
      this.projects.push(project);
    }
    return this.projects;
  }
}

class ProjectEntryParser {
  private readonly filePaths: {
    info: string;
    details: string;
    resume: string;
    images: string;
  };

  constructor(projectDir: string) {
    this.filePaths = {
      info: path.join(projectDir, "info.yaml"),
      details: path.join(projectDir, "details.md"),
      resume: path.join(projectDir, "resume.md"),
      images: path.join(projectDir, "images"),
    };
  }

  async parse(): Promise<Project> {
    const id = path.basename(path.dirname(this.filePaths.info));
    const details = await readFile(this.filePaths.details, "utf-8");
    const resume = await readFile(this.filePaths.resume, "utf-8");

    return {
      ...(await this.parseProjectInfo()),
      id,
      details,
      resume,
      icon: await this.getIconPath(),
      thumbnail: await this.getThumbnailImage(),
      showcaseImages: await this.getShowcaseImages(),
    };
  }

  private async parseProjectInfo(): Promise<ProjectEntry> {
    const contents = await readFile(this.filePaths.info, "utf-8");
    return projectEntrySchema.parse(parseYaml(contents));
  }

  private async getThumbnailImage() {
    const allImages = await readdir(this.filePaths.images);
    const thumbnail = allImages.find((file) => file.startsWith("thumbnail"));

    if (!thumbnail) {
      throw new Error(`No thumbnail image found in ${this.filePaths.images}`);
    }

    return path.join(this.filePaths.images, thumbnail);
  }

  private async getShowcaseImages() {
    const images = (await readdir(this.filePaths.images))
      .filter((file) => !file.startsWith("icon"))
      .slice()
      .sort((left, right) => {
        if (left.startsWith("thumbnail")) return -1;
        if (right.startsWith("thumbnail")) return 1;

        const leftNumber = Number.parseInt(left.split(".")[0]);
        const rightNumber = Number.parseInt(right.split(".")[0]);

        return leftNumber - rightNumber;
      });

    return images.map((file) => path.join(this.filePaths.images, file));
  }

  private async getIconPath() {
    const iconPath = path.join(this.filePaths.images, "icon.svg");
    try {
      await access(iconPath);
      return iconPath;
    } catch {
      return undefined;
    }
  }
}
