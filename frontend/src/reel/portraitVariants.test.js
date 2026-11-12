import { PORTRAIT_FORMATS } from "./portraitFilm";
import { EXPORT_PRESETS, EXPORT_FPS } from "./portraitExport";
import { CAMPAIGN_FILM_SCENES, CATEGORIES, CAMPAIGNS } from "./campaignFilm";

describe("Isolated full-duration portrait copies of V3",()=>{
  test("Stories uses a native 9:16 frame",()=>{
    expect(PORTRAIT_FORMATS.story).toMatchObject({width:1080,height:1920,aspect:"9:16"});
    expect(EXPORT_PRESETS.story).toMatchObject({width:1080,height:1920});
    expect(PORTRAIT_FORMATS.story.preview[0]/PORTRAIT_FORMATS.story.preview[1]).toBeCloseTo(9/16,5);
  });
  test("Feed vertical uses native 4:5 dimensions",()=>{
    expect(PORTRAIT_FORMATS.feed).toMatchObject({width:1080,height:1350,aspect:"4:5"});
    expect(EXPORT_PRESETS.feed).toMatchObject({width:1080,height:1350});
    expect(PORTRAIT_FORMATS.feed.preview[0]/PORTRAIT_FORMATS.feed.preview[1]).toBeCloseTo(4/5,5);
  });
  test("both have 30fps video and full-quality bitrates",()=>{
    expect(EXPORT_FPS).toBe(30);
    Object.values(EXPORT_PRESETS).forEach(p=>expect(p.bitrate).toBeGreaterThan(12e6));
  });
  test("V3 timeline, campaign choice and category trios unchanged",()=>{
    expect(CAMPAIGN_FILM_SCENES).toHaveLength(14);
    expect(CAMPAIGN_FILM_SCENES[0]).toEqual(["V2 INTRO",0,3.6]);
    expect(CAMPAIGN_FILM_SCENES.at(-1)).toEqual(["EK 3D",53.5,60]);
    expect(CAMPAIGNS).toHaveLength(6);
    expect(CATEGORIES.map(c=>c.name)).toEqual([
      "SOCIAL MEDIA","MANIPULATION","SOME DEZAINES*","VIDEO"
    ]);
    expect(CATEGORIES.every(c=>c.ids.length%3===0)).toBe(true);
    expect(CAMPAIGNS[0].count).toBe(12);
    expect(CAMPAIGNS[0].exclude).toEqual([10,11]);
  });
});
