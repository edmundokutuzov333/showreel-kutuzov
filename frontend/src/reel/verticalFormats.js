/**
 * Independent portrait delivery formats derived from V3.
 * No changes to the 16:9 original or its export preset table.
 */
const WIDTHS = Object.freeze({
  "720p": 720, "1080p": 1080, "1440p": 1440, "2160p": 2160
});
const BITRATES = Object.freeze({
  "720p": 8_000_000, "1080p": 16_000_000,
  "1440p": 26_000_000, "2160p": 42_000_000
});
export const VERTICAL_FORMATS = Object.freeze({
  story: Object.freeze({
    id: "story", label: "Stories / Reels", aspect: "9:16",
    ratio: 9 / 16, baseWidth: 1080, baseHeight: 1920,
    previewWidth: 540, previewHeight: 960, filename: "9x16"
  }),
  feed: Object.freeze({
    id: "feed", label: "Feed vertical", aspect: "4:5",
    ratio: 4 / 5, baseWidth: 1080, baseHeight: 1350,
    previewWidth: 720, previewHeight: 900, filename: "4x5"
  })
});
export const VERTICAL_FPS = 30;
export function verticalFormat(id) {
  if (!Object.prototype.hasOwnProperty.call(VERTICAL_FORMATS, id))
    throw new Error("Formato vertical inválido.");
  return VERTICAL_FORMATS[id];
}
export function verticalPreset(id, quality) {
  const format = verticalFormat(id);
  const width = WIDTHS[quality];
  if (!width) throw new Error("Qualidade MP4 vertical inválida.");
  return {
    width, height: Math.round(width / format.ratio),
    bitrate: BITRATES[quality], label: quality,
    format: format.id, aspect: format.aspect
  };
}
export function containRect(imageWidth, imageHeight, x, y, width, height) {
  if (!(imageWidth > 0 && imageHeight > 0 && width > 0 && height > 0))
    return null;
  const scale = Math.min(width / imageWidth, height / imageHeight);
  const w = imageWidth * scale;
  const h = imageHeight * scale;
  return { x: x + (width - w) / 2, y: y + (height - h) / 2, w, h };
}
