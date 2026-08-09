import { cp, mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { beforeEach, describe, expect, it } from "vitest";

import { ToolsParser } from "@src/tools";

describe("ToolsParser", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "tools-parser-"));
  });

  it("resolves icon paths from the tools index", async () => {
    await copyFixture("icon-paths");

    const tools = await new ToolsParser(tempDir).parse();

    expect(tools).toEqual([
      {
        name: "firebase",
        icon: path.join(tempDir, "icons", "firebase.png"),
      },
      {
        name: "typescript",
        icon: path.join(tempDir, "icons", "typescript.svg"),
      },
    ]);
  });

  async function copyFixture(fixtureName: string) {
    await cp(path.join(__dirname, "fixtures", fixtureName), tempDir, {
      recursive: true,
    });
  }
});
