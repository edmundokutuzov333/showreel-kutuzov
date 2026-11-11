import fs from 'fs';
import path from 'path';
const src=fs.readFileSync(path.resolve('src/reel/mp4Export.js'),'utf8');
describe('MP4 exporter contract',()=>{
  test('all four native export resolutions are configured',()=>{
    for(const [label,dim] of [
      ['720p','1280, height: 720'],['1080p','1920, height: 1080'],
      ['1440p','2560, height: 1440'],['2160p','3840, height: 2160']
    ]) {
      expect(src).toContain(label);
      expect(src).toContain(dim);
    }
  });
  test('uses H.264 MP4 + AAC instrumental rather than mislabeled WebM',()=>{
    expect(src).toContain('new Mp4OutputFormat()');
    expect(src).toContain('new AudioBufferSource(');
    expect(src).toContain('codec: "avc"');
    expect(src).toContain('codec: "aac"');
    expect(src).toContain('engine.renderFrame(t)');
  });
});
