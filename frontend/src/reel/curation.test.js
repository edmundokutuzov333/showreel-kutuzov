import { LOGOS } from './assets';
import { DIRECTOR_CUT_SCENES, SELECTED_WORKS } from './directorCut';
import { EK_POLYGONS } from './brandMark';
describe('Authentic curation',()=>{
test('all 20 client marks are distinct',()=>{expect(LOGOS).toHaveLength(20);expect(new Set(LOGOS).size).toBe(20)});
test('13 curated real works are unique and credited',()=>{expect(SELECTED_WORKS).toHaveLength(13);expect(new Set(SELECTED_WORKS.map(x=>x.id)).size).toBe(13);SELECTED_WORKS.forEach(x=>{expect(x.credit.length).toBeGreaterThan(2);expect(x.title.length).toBeGreaterThan(3)})});
test('official EK logo and chapters',()=>{expect(EK_POLYGONS).toHaveLength(3);expect(DIRECTOR_CUT_SCENES).toHaveLength(8);expect(DIRECTOR_CUT_SCENES.at(-1)[2]).toBe(60)});
});
