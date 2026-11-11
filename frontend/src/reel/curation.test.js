import fs from 'fs';
import path from 'path';
import { LOGOS } from './assets';
import { CAMPAIGNS, CATEGORIES, BRAND_NAMES, CAMPAIGN_FILM_SCENES, selectedDevelopmentAssets } from './campaignFilm';
import { EK_POLYGONS } from './brandMark';
const manifest=require('../../public/reel/campaigns/manifest.json');
const catalog=require('../../public/reel/catalog.json');
describe('Final V3 editorial/provenance rules',()=>{
 test('full original V2 intro, galaxy, index',()=>{
   expect(CAMPAIGN_FILM_SCENES[0]).toEqual(['V2 INTRO',0,3.6]);
   expect(CAMPAIGN_FILM_SCENES[1]).toEqual(['V2 GALAXY & INDEX',3.6,21]);
 });
 test('all six gallery sources retained, repeated ICOR visuals excluded',()=>{
   expect(manifest.campaigns.map(c=>c.frames.length)).toEqual([14,9,1,3,7,6]);
   expect(manifest.campaigns.flatMap(c=>c.frames)).toHaveLength(40);
   expect(CAMPAIGNS[0].exclude).toEqual([11,13]);
   expect(CAMPAIGNS.reduce((n,c)=>n+c.count-c.exclude.length,0)).toBe(38);
 });
 test('only four categories, in complete three-artwork beats',()=>{
   expect(CATEGORIES.map(c=>c.name)).toEqual([
     'SOCIAL MEDIA','MANIPULATION','SOME DEZAINES+','VIDEO'
   ]);
   CATEGORIES.forEach(c=>{
     expect(c.ids.length%3).toBe(0);
     expect(c.ids.length).toBeGreaterThanOrEqual(6);
   });
 });
 test('no duplicate filename, art source ID or project slug in development',()=>{
   const {campaignImages,categoryIds,categorySlugs}=
     selectedDevelopmentAssets(manifest,catalog);
   expect(campaignImages.length).toBe(38);
   expect(categoryIds.length).toBe(33);
   expect(new Set(campaignImages).size).toBe(38);
   expect(new Set(categorySlugs).size).toBe(33);
   campaignImages.forEach(src=>{
     expect(fs.existsSync(path.resolve('public'+src))).toBe(true);
   });
   categoryIds.forEach(id=>{
     const it=catalog.items.find(x=>x.id===id);
     expect(it.cat).not.toBe('CAMPAIGN');
     const f='public/reel/'+(it.video?'vid':'img')+'/'+String(id).padStart(3,'0')+'.'+(it.video?'mp4':'webp');
     expect(fs.existsSync(path.resolve(f))).toBe(true);
   });
 });
 test('twenty actual brands and a three-part real EK source mark',()=>{
   expect(LOGOS).toHaveLength(20);
   expect(BRAND_NAMES).toHaveLength(20);
   expect(new Set(LOGOS).size).toBe(20);
   expect(BRAND_NAMES).toContain('EMOSE');
   expect(BRAND_NAMES).toContain('JOAQUIM CHAVES SAÚDE');
   expect(EK_POLYGONS).toHaveLength(3);
 });
 test('uninterrupted total time 60 seconds',()=>{
   expect(CAMPAIGN_FILM_SCENES.at(-1)[2]).toBe(60);
   for(let i=1;i<CAMPAIGN_FILM_SCENES.length;i++)
     expect(CAMPAIGN_FILM_SCENES[i][1]).toBe(CAMPAIGN_FILM_SCENES[i-1][2]);
 });
});
