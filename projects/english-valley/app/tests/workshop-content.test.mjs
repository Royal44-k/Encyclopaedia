import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { workshopLines, workshopCues } from '../src/content/workshop-content.js';

const source = readFileSync(new URL('../../docs/design/v6/episodes/T01.md', import.meta.url), 'utf8');
const sourceRows = source.split('\n').map(line => line.split('|').slice(1,-1).map(s=>s.trim()))
  .filter(cells => /^T01\.\d{3}$/.test(cells[0]) && cells[1] !== 'LEARNER');
const manifest = JSON.parse(readFileSync(new URL('../public/audio/workshop-manifest.json', import.meta.url), 'utf8'));

test('T01 subtitles and recorded manifest match every original script line', () => {
  assert.equal(sourceRows.length, 39);
  assert.equal(Object.keys(workshopLines).length, sourceRows.length);
  assert.equal(Object.keys(manifest.lines).length, sourceRows.length);
  for (const [id,speaker,english] of sourceRows) {
    assert.equal(workshopLines[id].speaker, speaker);
    assert.equal(workshopLines[id].english, english);
    assert.equal(manifest.lines[id].text, english);
    assert.equal(manifest.lines[id].speaker, speaker);
    assert.ok(workshopLines[id].chinese.length > 0);
    assert.notEqual(speaker, 'LEARNER');
  }
});

test('T01 new role has an independent recording identity and every cue resolves', () => {
  assert.equal(manifest.status, 'ready');
  const ids = Object.values(manifest.voices).map(v=>v.voiceId);
  assert.equal(new Set(ids).size, 3);
  assert.equal(manifest.voices.IRIS.voiceId, 'af_bella');
  for (const cue of Object.values(workshopCues)) for (const id of cue) {
    assert.ok(workshopLines[id], id);
    assert.ok(manifest.lines[id], id);
  }
  assert.deepEqual(workshopCues.make, []);
  assert.deepEqual(workshopCues.static, ['T01.022']);
  assert.deepEqual(workshopCues.movement, ['T01.009']);
});
