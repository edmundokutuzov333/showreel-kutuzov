import { DIRECTOR_CUT_SCENES } from "./directorCut";
import { VINTAGE_DURATION } from "./editorialStudy";

describe("Kutuzov showreel version contract",()=>{
  test("director's cut is exactly 60 seconds and has no gaps",()=>{
    expect(DIRECTOR_CUT_SCENES[0][1]).toBe(3.6);
    for(let i=1;i<DIRECTOR_CUT_SCENES.length;i++){
      expect(DIRECTOR_CUT_SCENES[i][1]).toBe(DIRECTOR_CUT_SCENES[i-1][2]);
    }
    expect(DIRECTOR_CUT_SCENES.at(-1)[2]).toBe(60);
  });
  test("the editorial study retains its historical running time",()=>{
    expect(VINTAGE_DURATION).toBe(52);
  });
});
