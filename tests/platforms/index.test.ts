import { mkdtemp, cp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { beforeEach, describe, expect, it } from 'vitest';

import { PlatformsParser } from '@src/platforms.js';

describe('PlatformsParser', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'platforms-parser-'));
  });

  it('resolves the default icon path when icon is omitted', async () => {
    await copyFixture('default-icon');

    const parser = new PlatformsParser(tempDir);
    const platforms = await parser.parse();

    expect(platforms).toHaveLength(1);
    expect(platforms[0]).toEqual({
      name: 'github',
      color: '#000',
      icon: path.join(tempDir, 'icons', 'github.svg'),
    });
  });

  it('preserves the explicit icon filename when it is provided', async () => {
    await copyFixture('explicit-icon');

    const parser = new PlatformsParser(tempDir);
    const platforms = await parser.parse();

    expect(platforms).toHaveLength(1);
    expect(platforms[0]).toEqual({
      name: 'website',
      color: '#66f',
      icon: path.join(tempDir, 'icons', 'custom-website.svg'),
    });
  });

  it('rejects malformed platform content', async () => {
    await copyFixture('invalid-missing-color');

    const parser = new PlatformsParser(tempDir);

    await expect(parser.parse()).rejects.toThrow();
  });

  async function copyFixture(fixtureName: string) {
    await cp(path.join(__dirname, 'fixtures', fixtureName), tempDir, {
      recursive: true,
    });
  }
});