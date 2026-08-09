import path from "node:path";

import { describe, expect, it } from "vitest";

import { ProjectsParser } from "@src/projects";

describe("ProjectsParser", () => {
  it("parses a project entry from the filesystem", async () => {
    const parser = new ProjectsParser(fixturePath("basic"));
    await expect(parser.parse()).resolves.toEqual([proceduralTerrainProject]);
  });

  it("uses the icon file when one is present", async () => {
    const parser = new ProjectsParser(fixturePath("with-icon"));

    await expect(parser.parse()).resolves.toEqual([
      expect.objectContaining({
        icon: fixturePath(
          "with-icon",
          "procedural-terrain-generation",
          "images",
          "icon.svg",
        ),
      }),
    ]);
  });

  it("rejects invalid project metadata", async () => {
    const parser = new ProjectsParser(fixturePath("invalid"));
    await expect(parser.parse()).rejects.toThrow();
  });
});

function fixturePath(...segments: string[]) {
  return path.resolve(__dirname, "fixtures", ...segments);
}

const proceduralTerrainProject = {
  id: "procedural-terrain-generation",
  title: "procedural terrain generation",
  favourite: false,
  description: "2D terrain generation using perling noise",
  tags: ["graphics", "algorithms"],
  tools: ["typescript", "firebase"],
  links: [
    {
      platform: "blog post",
      url: "https://mohsenelsisi.com/blog/how-minecraft-has-an-infinite-amount-worlds/",
    },
    {
      platform: "github",
      url: "https://github.com/mohsen-w-elsisi/procedural-terrain-gen",
    },
    {
      platform: "website",
      url: "https://mohsen-procedural-gen.web.app/",
    },
  ],
  details: "This project details markdown fixture.",
  resume: "This project resume markdown fixture.",
  icon: undefined,
  thumbnail: fixturePath(
    "basic",
    "procedural-terrain-generation",
    "images",
    "thumbnail.png",
  ),
  showcaseImages: [
    fixturePath(
      "basic",
      "procedural-terrain-generation",
      "images",
      "thumbnail.png",
    ),
    fixturePath("basic", "procedural-terrain-generation", "images", "1.png"),
    fixturePath("basic", "procedural-terrain-generation", "images", "10.png"),
  ],
};
