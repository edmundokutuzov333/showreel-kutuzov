import fs from "fs";
import path from "path";
import {
  VERTICAL_FORMATS, VERTICAL_FPS, verticalFormat,
  verticalPreset, containRect
} from "./verticalFormats";
import { CAMPAIGN_FILM_SCENES, CAMPAIGNS, CATEGORIES, BRAND_NAMES } from "./campaignFilm";

const source = name => fs.readFileSync(path.resolve("src/reel/" + name), "utf8");

describe("Independent V3 portrait motion and MP4 exports", () => {
  test("Stories and Reels deliver exact 9:16 at every original quality tier", () => {
    expect(VERTICAL_FORMATS.story.baseWidth).toBe(1080);
    expect(VERTICAL_FORMATS.story.baseHeight).toBe(1920);
    for (const [quality, width] of [
      ["720p", 720], ["1080p", 1080],
      ["1440p", 1440], ["2160p", 2160]
    ]) {
      expect(verticalPreset("story", quality)).toMatchObject({
        width, height: Math.round(width * 16 / 9), aspect: "9:16"
      });
    }
  });
  test("Feed delivers exact 4:5 and remains a separate variant", () => {
    expect(VERTICAL_FORMATS.feed.baseWidth).toBe(1080);
    expect(VERTICAL_FORMATS.feed.baseHeight).toBe(1350);
    for (const [quality, width] of [
      ["720p", 720], ["1080p", 1080],
      ["1440p", 1440], ["2160p", 2160]
    ]) {
      expect(verticalPreset("feed", quality)).toMatchObject({
        width, height: width * 5 / 4, aspect: "4:5"
      });
    }
    expect(verticalFormat("story")).not.toBe(verticalFormat("feed"));
    expect(() => verticalFormat("widescreen")).toThrow();
    expect(() => verticalPreset("story", "360p")).toThrow();
  });
  test("Every source image is letterboxed to fit, never stretched or cut", () => {
    expect(containRect(1920, 1080, 0, 0, 1080, 1920)).toEqual({
      x: 0, y: 656.25, w: 1080, h: 607.5
    });
    expect(containRect(600, 1200, 0, 0, 1080, 1350)).toEqual({
      x: 202.5, y: 0, w: 675, h: 1350
    });
    expect(containRect(0, 0, 0, 0, 1080, 1350)).toBeNull();
  });
  test("Both copies use the last approved V3 and all its unique sections", () => {
    expect(CAMPAIGN_FILM_SCENES.at(-1)[2]).toBe(60);
    expect(CAMPAIGNS).toHaveLength(6);
    expect(CATEGORIES).toHaveLength(4);
    expect(BRAND_NAMES).toHaveLength(20);
    expect(VERTICAL_FPS).toBe(30);
    expect(source("verticalEngine.js")).toContain('super(document.createElement("canvas"), "v3")');
    expect(source("verticalEngine.js")).toContain("CAMPAIGNS.find(");
    expect(source("verticalEngine.js")).toContain("CATEGORIES.find(");
  });
  test("Portrait export uses H.264 MP4 + AAC and never mutates the 16:9 export pipeline", () => {
    const portrait = source("verticalMp4Export.js");
    const landscape = source("mp4Export.js");
    expect(portrait).toContain("new Mp4OutputFormat()");
    expect(portrait).toContain('codec: "avc"');
    expect(portrait).toContain('codec: "aac"');
    expect(portrait).toContain('score.version = "v3"');
    expect(portrait).toContain("getDisplayHeight()");
    expect(portrait).toContain("outputCanvas.width = previous.width");
    expect(landscape).toContain("1920, height: 1080");
    expect(landscape).toContain("3840, height: 2160");
  });
});
