import { ARCHIVE_LABELS, ARCHIVE_LINES } from './archive';
describe('Final V3 index wording',()=>{
  test('STAY categories contain only authored names and taglines, no counters',()=>{
    expect(ARCHIVE_LABELS.DESIGN).toBe('SOME DEZAINES*');
    expect(ARCHIVE_LINES).toEqual({
      ALL:'EVERY ANGLE','SOCIAL MEDIA':'MORE THAN A POST',
      'IMAGE MANIPULATION':'BEND REALITY',DESIGN:'OUTSIDE THE LINES',
      CAMPAIGN:'MADE TO MATTER',VIDEO:'NEVER JUST FRAMES'
    });
    expect(Object.values(ARCHIVE_LINES).join(' ')).not.toMatch(/works|\d{2,}/i);
  });
});
