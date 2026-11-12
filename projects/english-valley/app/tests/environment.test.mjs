import assert from 'node:assert/strict';
import test from 'node:test';
import * as THREE from 'three';
import { createEnvironment } from '../src/world/environment.js';

test('one shared scene preserves installed objects across historical records and validates real placement zones', () => {
  const world = createEnvironment(THREE);
  try {
    const objects = [];
    world.group.traverse(object => objects.push(object));
    for (const name of ['obj.bridge.main', 'obj.greenhouse.main']) {
      assert.equal(objects.filter(object => object.name === name).length, 1);
    }
    assert.deepEqual(Object.keys(world.anchors).sort(), ['bare_bed','exit_path','flower_ring','greenhouse','stream_bridge','treehouse','upper_stream','workshop'].map(id => `loc.${id}`));
    const bottle = world.interactables.find(object => object.userData.action === 'bottle');
    const cover = objects.find(object => object.name === 'obj.runoff.cover');
    assert.equal(bottle.visible, true);
    assert.equal(cover.visible, false);
    const source = world.getPlacementTransform('source_cover_zone');
    const check = world.validatePlacement(source);
    assert.equal(check.valid, true);
    assert.equal(check.placementBlocksRoute, false);
    const unrelated = world.validatePlacement(world.getPlacementTransform('unrelated_zone'));
    assert.equal(unrelated.zone, 'unrelated_zone');
    assert.equal(unrelated.valid, false);
    assert.equal(unrelated.coverOrientationValid, true);
    const malformed = structuredClone(source);
    malformed.position[1] += 10;
    assert.equal(world.validatePlacement(malformed).coverOrientationValid, false);
    const blocking = world.validatePlacement(world.getPlacementTransform('outside_allowed_zones'));
    assert.equal(blocking.valid, false);
    assert.equal(blocking.placementBlocksRoute, true);
    world.setWorldState({'world.litterRemoved':true,'world.coverInstalled':true,'world.coverTransform':source});
    assert.equal(bottle.visible, false);
    assert.equal(cover.visible, true);
    assert.deepEqual(cover.position.toArray(), source.position);
    world.setObservation('before_rain');
    assert.equal(bottle.visible, true);
    assert.equal(cover.visible, false);
    world.setObservation('current');
    assert.equal(bottle.visible, false);
    assert.equal(cover.visible, true);
    assert.deepEqual(cover.position.toArray(), source.position);
  } finally {
    world.dispose();
  }
});
