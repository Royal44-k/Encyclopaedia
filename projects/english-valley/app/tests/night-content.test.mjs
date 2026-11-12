import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { nightLines,nightCues,nightSoundDescriptions } from '../src/content/night-content.js';
const source=readFileSync(new URL('../../docs/design/v6/episodes/T02.md',import.meta.url),'utf8');
const rows=source.split('\n').map(line=>line.split('|').slice(1,-1).map(s=>s.trim())).filter(c=>/^T02\.\d{3}$/.test(c[0])&&c[1]!=='LEARNER');
const manifest=JSON.parse(readFileSync(new URL('../public/audio/night-manifest.json',import.meta.url),'utf8'));
const base=JSON.parse(readFileSync(new URL('../public/audio/manifest.json',import.meta.url),'utf8'));
test('T02 records sixteen exact original NPC lines and never impersonates the learner',()=>{
  assert.equal(rows.length,16);assert.equal(Object.keys(nightLines).length,16);assert.equal(Object.keys(manifest.lines).length,16);
  for(const [id,speaker,english] of rows){assert.equal(nightLines[id].speaker,speaker);assert.equal(nightLines[id].english,english);assert.ok(nightLines[id].chinese);assert.equal(manifest.lines[id].text,english);assert.equal(manifest.lines[id].speaker,speaker);assert.equal(manifest.lines[id].voiceId,base.voices[speaker].voiceId);assert.ok(existsSync(new URL('../public'+manifest.lines[id].src,import.meta.url)));}
});
test('T02 keeps distinct role identities and clues have separate source files',()=>{
  assert.equal(manifest.status,'ready');assert.equal(new Set(Object.values(manifest.voices).map(v=>v.voiceId)).size,4);
  for(const cue of Object.values(nightCues))for(const id of cue)assert.ok(nightLines[id]);
  assert.notEqual(manifest.effects.tap.src,manifest.effects.creak.src);
  assert.ok(manifest.music.night);assert.ok(manifest.music.night_reflection);assert.ok(manifest.ambience.night_wind);
  for(const c of Object.values(nightSoundDescriptions)){assert.ok(c.english);assert.ok(c.chinese);assert.doesNotMatch(c.english,/metal|board|foot/i);}
});
