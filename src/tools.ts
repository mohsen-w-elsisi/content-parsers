import { readFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import type { Parser } from "./parser.js";

export class ToolsParser implements Parser<Tool> {
  constructor(private readonly rootDir: string) {}

  async parse(): Promise<Tool[]> {
    const indexPath = path.resolve(this.rootDir, "index.json");
    const contents = await readFile(indexPath, "utf-8");
    const toolIndex = toolIndexSchema.parse(JSON.parse(contents));

    return Object.entries(toolIndex).map(([name, iconFilename]) => ({
      name,
      icon: path.join(this.rootDir, "icons", iconFilename),
    }));
  }
}

const toolIndexSchema = z.record(z.string(), z.string());

export interface Tool {
  name: string;
  icon: string;
}
