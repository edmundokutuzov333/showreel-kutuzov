import fs from "fs";
import path from "path";

describe("pre-rendered EN/PT narration masters", () => {
  for (const lang of ["en", "pt"]) {
    test(`${lang} contains 11 playable, non-empty MP3 masters`, () => {
      for (let idx = 0; idx < 11; idx++) {
        const file = path.resolve(process.cwd(), "public", "reel", "vo", lang, `${idx}.mp3`);
        const bytes = fs.readFileSync(file);
        expect(bytes.length).toBeGreaterThan(5000);
        const isId3 = bytes.toString("ascii", 0, 3) === "ID3";
        const isFrame = bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0;
        expect(isId3 || isFrame).toBe(true);
      }
    });
  }
});
