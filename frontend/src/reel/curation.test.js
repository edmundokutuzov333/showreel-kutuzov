import fs from 'fs';
import path from 'path';
import { LOGOS } from './assets';
import { CAMPAIGNS, CATEGORIES, BRAND_NAMES, CAMPAIGN_FILM_SCENES, ICOR_LAST_PAIR_LAYOUT, selectedDevelopmentAssets } from './campaignFilm';
import { EK_POLYGONS } from './brandMark';
const manifest=require('../../public/reel/campaigns/manifest.json');
const catalog=require('../../public/reel/catalog.json');
describe('Final V3 editorial/provenance rules',()=>{
 test('full original V2 intro, galaxy, index',()=>{
   expect(CAMPAIGN_FILM_SCENES[0]).toEqual(['V2 INTRO',0,3.6]);
   expect(CAMPAIGN_FILM_SCENES[1]).toEqual(['V2 GALAXY & INDEX',3.6,21]);
 });
 test('all six gallery sources retained, repeated ICOR visuals excluded',()=>{
   expect(manifest.campaigns.map(c=>c.frames.length)).toEqual([12,9,1,3,7,6]);
   expect(manifest.campaigns.flatMap(c=>c.frames)).toHaveLength(38);
   expect(CAMPAIGNS[0].exclude).toEqual([10,11]);
   expect(CAMPAIGNS.reduce((n,c)=>n+c.count-c.exclude.length,0)).toBe(36);
 });
 test('ICOR closing shot contains 08 and 09; rejected 10 and 12 are absent',()=>{
   const files=manifest.campaigns[0].frames;
   const chosen=files.filter((_,i)=>!CAMPAIGNS[0].exclude.includes(i));
   expect(chosen.slice(-2)).toEqual([
     '/reel/campaigns/icor-depressao/08.webp',
     '/reel/campaigns/icor-depressao/09.webp'
   ]);
   expect(chosen).not.toContain('/reel/campaigns/icor-depressao/10.webp');
   expect(chosen).not.toContain('/reel/campaigns/icor-depressao/12.webp');
   expect(fs.existsSync(path.resolve('public/reel/campaigns/icor-depressao/10.webp'))).toBe(false);
   expect(fs.existsSync(path.resolve('public/reel/campaigns/icor-depressao/12.webp'))).toBe(false);
   expect(ICOR_LAST_PAIR_LAYOUT).toHaveLength(2);
   ICOR_LAST_PAIR_LAYOUT.forEach(p=>{
     expect(p.h).toBeGreaterThan(5);
     expect(p.w).toBeGreaterThan(5.5);
   });
 });
 test('only four categories, in complete three-artwork beats',()=>{
   expect(CATEGORIES.map(c=>c.name)).toEqual([
     'SOCIAL MEDIA','MANIPULATION','SOME DEZAINES*','VIDEO'
   ]);
   CATEGORIES.forEach(c=>{
     expect(c.ids.length%3).toBe(0);
     expect(c.ids.length).toBeGreaterThanOrEqual(6);
   });
 });
 test('no duplicate filename, art source ID or project slug in development',()=>{
   const {campaignImages,categoryIds,categorySlugs}=
     selectedDevelopmentAssets(manifest,catalog);
   expect(campaignImages.length).toBe(36);
   expect(categoryIds.length).toBe(33);
   expect(new Set(campaignImages).size).toBe(36);
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
 test('Eight exact artwork replacements keep three different art IDs per card',()=>{
   expect(CATEGORIES.find(c=>c.name==='SOME DEZAINES*').ids).toEqual([
     132,71,72,87,90,89,138,137,135
   ]);
   expect(CAMPAIGNS.find(c=>c.slug==='cozinhar-arte').extraIds).toEqual([147]);
   const chosen=selectedDevelopmentAssets(manifest,catalog);
   expect(chosen.extraIds).toEqual([147]);
   expect(chosen.categoryIds).not.toContain(147);
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
