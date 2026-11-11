/**
 * Reproducible import of Edmundo Kutuzov's six published campaigns.
 * Reads the actual case-study gallery on edmundokutuzov.art, checks the
 * artwork count against the approved curation, and caches lossless-layout
 * WebP derivatives. Does not fabricate images or crop campaign artwork.
 */
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const sharp=require("/tmp/ek-image-tools/node_modules/sharp");
sharp.cache(false);sharp.concurrency(1);
const ROOT=path.join(__dirname,"..");
const COLLECTION=[
  {slug:"icor-depressao",page:"a-depressao-e-real",title:"A DEPRESSÃO É REAL",client:"ICOR",count:14},
  {slug:"diga-yes",page:"digas-yes-e-viva-o-mundo-online-campaign",title:"DIGA YES & VIVA O MUNDO ONLINE",client:"WEBMASTERS",count:9},
  {slug:"cozinhar-arte",page:"cozinhar-e-arte",title:"COZINHAR É ARTE",client:"PEMBE MOZ",count:1},
  {slug:"agua-e-vida",page:"agua-e-vida-100-agua",title:"ÁGUA É VIDA E VOCÊ É 100% ÁGUA",client:"FONTE FRESCA",count:3},
  {slug:"super-mares",page:"viva-a-experiencia-no-super-mares",title:"VIVA A EXPERIÊNCIA NO SUPER MARÉS",client:"SUPER MARÉS",count:7},
  {slug:"we-are-giz",page:"we-are-giz",title:"WE ARE GIZ",client:"GIZ",count:6},
];
const WHITELIST=new Set(["qwjaoheaolpxtciljzvb.supabase.co","edmundokutuzov.art"]);
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function fetchBuffer(url,kind){
  const parsed=new URL(url);
  if(parsed.protocol!=="https:"||!WHITELIST.has(parsed.hostname))throw Error("Unapproved media domain");
  let last;
  for(let attempt=0;attempt<3;attempt++){
    try{
      const r=await fetch(url,{signal:AbortSignal.timeout(30000),headers:{"User-Agent":"EK-showreel/1.0"}});
      if(!r.ok)throw Error("HTTP "+r.status+" "+url);
      const mime=r.headers.get("content-type")||"";
      if(kind==="image"&&!mime.startsWith("image/"))throw Error("Unexpected MIME "+mime);
      return Buffer.from(await r.arrayBuffer());
    }catch(e){last=e;if(attempt<2)await delay((attempt+1)*800)}
  }
  throw last;
}
async function readGallery(c){
  const url="https://edmundokutuzov.art/work/"+c.page;
  const html=(await fetchBuffer(url,"html")).toString("utf8");
  const marker=html.match(/gallery:\$R\[\d+\]=/);
  if(!marker)throw Error("Published gallery not found "+c.page);
  const tail=html.slice(marker.index+marker[0].length);
  const end=tail.indexOf("]");
  if(end<0)throw Error("Unexpected gallery payload "+c.page);
  const urls=JSON.parse(tail.slice(0,end+1));
  if(urls.length!==c.count||new Set(urls).size!==urls.length)throw Error(
    "Gallery changed for "+c.slug+"; expected "+c.count+", got "+urls.length);
  return {url,urls};
}
async function run(){
  const campaigns=[],checksums=[],provenance=[];
  for(const c of COLLECTION){
    const {url,urls}=await readGallery(c);
    const frames=[];
    for(let i=0;i<urls.length;i++){
      // ICOR 10 and 12 were expressly rejected; never reimport them.
      if(c.slug==="icor-depressao" && (i===10||i===12)){
        fs.rmSync(path.join(ROOT,"frontend/public/reel/campaigns",c.slug,
          String(i).padStart(2,"0")+".webp"),{force:true});
        continue;
      }
      const buf=await fetchBuffer(urls[i],"image");
      const folder=path.join(ROOT,"frontend/public/reel/campaigns",c.slug);
      fs.mkdirSync(folder,{recursive:true});
      const file=path.join(folder,String(i).padStart(2,"0")+".webp");
      const info=await sharp(buf,{limitInputPixels:1000000000})
        .rotate().resize({width:1400,height:1400,fit:"inside",withoutEnlargement:true})
        .webp({quality:82,effort:4,alphaQuality:90}).toFile(file);
      if(info.width<180||info.height<180||info.size<2000)throw Error("Invalid frame: "+file);
      frames.push("/reel/campaigns/"+c.slug+"/"+String(i).padStart(2,"0")+".webp");
      checksums.push({file:path.relative(ROOT,file),bytes:info.size,
        sha256:crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")});
    }
    campaigns.push({slug:c.slug,title:c.title,client:c.client,frames});
    provenance.push({slug:c.slug,source_page:url,source_urls:urls});
    process.stdout.write("CAMPAIGN "+c.slug+": "+frames.length+" verified artworks\n");
  }
  if(checksums.length!==38)throw Error("Incorrect total gallery size "+checksums.length);
  fs.writeFileSync(path.join(ROOT,"frontend/public/reel/campaigns/manifest.json"),
    JSON.stringify({campaigns},null,2)+"\n");
  fs.writeFileSync(path.join(ROOT,"scripts/campaign-sources.json"),
    JSON.stringify({campaigns:provenance},null,2)+"\n");
  fs.writeFileSync(path.join(ROOT,"scripts/campaign-asset-checksums.json"),
    JSON.stringify({created:"2026-11-11",assets:checksums},null,2)+"\n");
  console.log("ALL 38 APPROVED ARTWORKS IMPORTED");
}
run().catch(e=>{console.error(e);process.exit(1)});

