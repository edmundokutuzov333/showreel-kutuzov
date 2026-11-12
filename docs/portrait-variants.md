# Portrait Editions, preserving the original V3

The two new portrait editions use independent scene graphs based on V3.
The original 16:9 film remains the default and retains its original
engine, scenes, artwork data, instrumental soundtrack and export pipeline.

## Output formats

| Edition | Ratio | Native MP4 dimensions | Video | Audio |
| --- | --- | --- | --- | --- |
| V3 original | 16:9 | existing 720p/1080p/1440p/4K options | H.264 30 fps | AAC instrumental |
| V3 Stories | 9:16 | 1080 x 1920 | H.264 30 fps | AAC instrumental |
| V3 Feed portrait | 4:5 | 1080 x 1350 | H.264 30 fps | AAC instrumental |

portraitEngine.js is an independent copy of the approved engine.
portraitFilm.js uses the official V3 builder to produce an isolated new
scene graph, then applies alternate portrait-only compositions.
portraitExport.js is an independent copy of the native MP4 exporter.
Both portrait versions retain the 60-second storyline with the V2
opening, galaxy/index, six campaigns, four categories, 20 brand
identities, EK 3D and soundtrack. They do not introduce artwork repeats.

The 9:16 and 4:5 editions use authored artwork placements and typography,
not a widescreen cropped master. The export dimensions reflect actual
WebGL rendered frames rather than upscaling or renaming a file.

The user interface lets a viewer switch between V3 official, Stories
and vertical feed. Changing the edition discards any old MP4 blob URL.
Both portrait editions use the same MP4 one-click download after export.

Some Instagram upload flows may present feed videos as Reels; confirm
the posting surface and the final preview. Important information is
positioned away from Stories top/bottom interface regions. No browser
can guarantee a 60-second export on devices without adequate H.264 and
WebGL capabilities; inspect each generated master before posting.
