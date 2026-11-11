import { CAMPAIGN_FILM_SCENES } from './campaignFilm';
import { VINTAGE_DURATION } from './editorialStudy';
describe('Three showreel versions',()=>{
 test('V3 restores the original 21-second V2 introduction',()=>{
   expect(CAMPAIGN_FILM_SCENES[0][1]).toBe(0);
   expect(CAMPAIGN_FILM_SCENES[1][1]).toBe(3.6);
   expect(CAMPAIGN_FILM_SCENES[1][2]).toBe(21);
   expect(CAMPAIGN_FILM_SCENES.at(-1)[2]).toBe(60);
 });
 test('V1 retains its 52-second editorial reconstruction',()=>{
   expect(VINTAGE_DURATION).toBe(52);
 });
});
