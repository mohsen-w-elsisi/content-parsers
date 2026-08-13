import { readFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import type { Parser } from "./parser.js";

export class PlatformsParser implements Parser<Platform> {
  constructor(private readonly rootDir: string) {}

  async parse(): Promise<Platform[]> {
    const indexPath = path.resolve(this.rootDir, "index.json");
    const contents = await readFile(indexPath, "utf-8");
    const platforms = z.array(platformSourceSchema).parse(JSON.parse(contents));

    return platforms.map((platform) => this.normalizePlatform(platform));
  }

  private normalizePlatform(platform: PlatformSource): Platform {
    const iconPath = platform.icon ?? `${platform.name}.svg`;
    return {
      ...platform,
      icon: path.join(this.rootDir, "icons", iconPath),
    };
  }
}

export interface Platform {
  name: string;
  color: string;
  icon: string;
}

const platformSourceSchema = z.object({
  name: z.string(),
  color: z.string(),
  icon: z.string().optional(),
});

type PlatformSource = z.infer<typeof platformSourceSchema>;

export const platformZodSchema = z.object({
  name: z.string(),
  color: z.string(),
  icon: z.string(),
});
