import { LOGOS } from './assets';
import { CAMPAIGNS, CATEGORIES, BRAND_NAMES, CAMPAIGN_FILM_SCENES } from './campaignFilm';
import { EK_POLYGONS } from './brandMark';
const registry=require('../../public/reel/campaigns/manifest.json');
describe('Authentic cinematic campaign cut',()=>{
  test('all six full campaigns',()=>{
    expect(CAMPAIGNS).toHaveLength(6);
    expect(CAMPAIGNS.map(x=>x.count)).toEqual([14,9,1,3,7,6]);
    expect(CAMPAIGNS.reduce((n,x)=>n+x.count,0)).toBe(40);
    expect(registry.campaigns.map(x=>x.frames.length)).toEqual([14,9,1,3,7,6]);
    const paths=registry.campaigns.flatMap(c=>c.frames);
    expect(paths).toHaveLength(40);
    expect(new Set(paths).size).toBe(40);
  });
  test('five legitimate categories',()=>{
    expect(CATEGORIES.map(x=>x.name)).toEqual(['SOCIAL MEDIA','MANIPULATION','SOME DEZAINES+','VIDEO','CAMPAIGN DESIGN']);
  });
  test('all twenty brand collaborations and the actual EK mark',()=>{
    expect(LOGOS).toHaveLength(20);
    expect(BRAND_NAMES).toHaveLength(20);
    expect(EK_POLYGONS).toHaveLength(3);
  });
  test('no gaps in the complete sixty-second cut',()=>{
    expect(CAMPAIGN_FILM_SCENES[0][1]).toBe(0);
    expect(CAMPAIGN_FILM_SCENES.at(-1)[2]).toBe(60);
    for(let i=1;i<CAMPAIGN_FILM_SCENES.length;i++)expect(CAMPAIGN_FILM_SCENES[i][1]).toBe(CAMPAIGN_FILM_SCENES[i-1][2]);
  });
});
