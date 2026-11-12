import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { applyEvent, createInitialState, createJourneyStore } from '../src/core/journey.js';

const runtime = process.env.PLAYWRIGHT_MODULE || 'C:/Users/lenovo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const executablePath = process.env.BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const url = process.env.APP_URL || 'http://127.0.0.1:4173/';
const artifacts = fileURLToPath(new URL(`../${process.env.ARTIFACTS_DIR||'artifacts'}/`, import.meta.url));
const journeyKey = 'english-valley.journey.v1';
const mediaKey = 'english-valley.media.v1';
const browser = await (await import(pathToFileURL(runtime).href)).chromium.launch({
  headless: true,
  executablePath,
  args: ['--enable-unsafe-swiftshader'],
});
await mkdir(artifacts, { recursive: true });

const results = [];
let build;
const action = (page, name) => page.locator(`[data-action="${name}"]`).first();
const click = (page, name) => action(page, name).click();
const ready = (page) => page.locator('[data-action="begin"]:not(:disabled)').waitFor({ timeout: 60000 });
const walkFinished = (page) => page.locator('.walk-note').waitFor({ state: 'detached' });
const raw = (page, key = journeyKey) => page.evaluate(key => localStorage.getItem(key), key);
const state = async (page) => JSON.parse(await raw(page));
const shot = (page, name) => page.screenshot({ path: join(artifacts, `resilience-${name}.png`) });
const arm = (page, fault) => page.evaluate(fault => window.testStorageFaults.arm(fault), fault);
const rejected = (page) => page.evaluate(() => window.testStorageFaults.rejected);
const entries = (snapshot, event) => snapshot.acceptedEvents.filter(command => command.event === event);

async function run(name, test, { seed = {}, fault, reduced = true, viewport = { width: 1152, height: 800 } } = {}) {
  const context = await browser.newContext({ viewport, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const page = await context.newPage();
  const errors = [];
  page.setDefaultTimeout(12000);
  page.on('pageerror', error => errors.push({ type: 'pageerror', message: error.message }));
  page.on('console', message => {
    if (message.type() === 'error') errors.push({ type: 'console', message: message.text() });
  });
  await page.addInitScript(({ seed, fault, journeyKey }) => {
    const setItem = Storage.prototype.setItem;
    const bootMarker = '__resilience_seeded';
    const faultKey = '__resilience_armed';
    const rejectionKey = '__resilience_rejected';
    if (!sessionStorage.getItem(bootMarker)) {
      for (const [key, value] of Object.entries(seed)) setItem.call(localStorage, key, value);
      if (fault) setItem.call(sessionStorage, faultKey, JSON.stringify(fault));
      setItem.call(sessionStorage, bootMarker, 'yes');
    }
    const rejected = JSON.parse(sessionStorage.getItem(rejectionKey)) || [];
    window.testStorageFaults = {
      arm: fault => setItem.call(sessionStorage, faultKey, JSON.stringify(fault)),
      rejected,
    };
    Storage.prototype.setItem = function (key, value) {
      const armed = JSON.parse(sessionStorage.getItem(faultKey));
      if (this === localStorage && armed?.key === key) {
        const parsed = JSON.parse(value);
        const command = key === journeyKey ? parsed.acceptedEvents.at(-1) : undefined;
        if (armed.event === undefined || command?.event === armed.event) {
          sessionStorage.removeItem(faultKey);
          rejected.push({ key, event: command?.event, id: command?.id, input: command?.input });
          setItem.call(sessionStorage, rejectionKey, JSON.stringify(rejected));
          throw new DOMException(`Injected storage write failure (${command?.event || key})`, 'QuotaExceededError');
        }
      }
      return setItem.call(this, key, value);
    };
  }, { seed, fault, journeyKey });

  let failure;
  let details;
  try {
    await page.goto(url);
    await ready(page);
    const bundle = await page.locator('script[type="module"][src]').first().getAttribute('src');
    build ??= bundle;
    assert.equal(bundle, build, 'Preview bundle changed during the run');
    details = await test(page);
    assert.deepEqual(errors, [], 'Unexpected browser errors');
  } catch (error) {
    failure = error.message;
    await shot(page, `failure-${name}`).catch(() => {});
  } finally {
    const result = { name, passed: !failure, details, failure, rejected: await rejected(page).catch(() => []), errors };
    results.push(result);
    console.log(JSON.stringify(result));
    await context.close();
  }
}

async function bridge(page) {
  await click(page, 'begin');
  await walkFinished(page);
  assert.equal((await state(page)).nodeId, 'j.bridge_record');
}

async function openModel(page) {
  await click(page, 'begin');
  await walkFinished(page);
  assert.equal((await state(page)).nodeId, 'j.model');
}

async function startDifferentCandidate(page) {
  await openModel(page);
  const before = await state(page);
  const position = before.fields['model.latestPosition'] === 'source_cover_zone' ? 'unrelated_zone' : 'source_cover_zone';
  await page.locator(`[data-action="model-position"][data-position="${position}"]`).click();
  await click(page, 'run-trial');
  const running = await state(page);
  const runId = running.fields['model.activeRunId'];
  assert.equal(running.fields['model.phase'], 'running');
  assert.equal(running.fields['model.runningPosition'], position);
  assert.ok(runId);
  return { before, running, runId, position };
}

async function assertPreviousResult(page, trial) {
  const { before, position, runId } = trial;
  const { fields } = await state(page);
  for (const key of ['latestPosition', 'latestResult', 'latestTrialId', 'trials']) {
    assert.deepEqual(fields[`model.${key}`], before.fields[`model.${key}`]);
  }
  assert.equal(fields['model.phase'], 'idle');
  assert.equal(fields['model.activeRunId'], null);
  assert.equal(fields['model.runningPosition'], null);
  assert.equal(fields['model.candidatePosition'], position);
  assert.equal(fields['world.coverInstalled'], false);
  assert.equal(fields['model.trials'].some(trial => trial.runId === runId), false);
  assert.equal(await page.locator('[data-action="model-position"].selected').getAttribute('data-position'), position);
  assert.equal(await page.locator('.trial-progress > i').evaluate(bar => bar.style.width), '0%');
  const source = before.fields['model.latestPosition'] === 'source_cover_zone';
  await page.getByText(`Last completed comparison · ${source ? 'Over the exposed soil' : 'Beside the soil source'}`).waitFor();
  assert.equal(await page.locator('.measure-note').textContent(), source ? 'Less soil followed this path.' : 'No difference in this comparison.');
}

try {
  if (!process.argv.includes('--model-only')) {
    await run('entry-write', async page => {
      await click(page, 'begin');
      assert.equal(await raw(page), null);
      assert.equal(await action(page, 'begin').isEnabled(), true);
      assert.equal(await action(page, 'begin').isVisible(), true);
      assert.match(await page.locator('#toast').textContent(), /Injected storage write failure/);
      const [fault] = await rejected(page);
      assert.equal(fault?.event, 'SESSION_OPENED');
      await bridge(page);
      const [opened] = entries(await state(page), 'SESSION_OPENED');
      assert.equal(opened.id, fault.id);
      assert.equal(entries(await state(page), 'SESSION_OPENED').length, 1);
      return { committed: opened.event, sameCommandId: true };
    }, { fault: { key: journeyKey, event: 'SESSION_OPENED' } });

    await run('evidence-media-write', async page => {
      await bridge(page);
      await arm(page, { key: mediaKey });
      await click(page, 'evidence-bridge');
      assert.equal(await action(page, 'record-evidence').count(), 0);
      assert.equal(await raw(page, mediaKey), null);
      assert.equal((await state(page)).fields['evidence.bridge'], 'unseen');
      assert.match(await page.locator('#toast').textContent(), /Storage is full/);
      assert.equal((await rejected(page))[0]?.key, mediaKey);
      await click(page, 'evidence-bridge');
      await page.waitForFunction(() => {
        const images = [...document.querySelectorAll('.evidence-photo img')];
        return images.length === 2 && images.every(image => image.complete && image.naturalWidth > 0);
      });
      const stored = JSON.parse(await raw(page, mediaKey));
      const ids = ['record.bridge.before_rain.v1', 'record.bridge.current_round.v1'];
      const rendered = await page.locator('.evidence-photo img').evaluateAll(images => images.map(image => image.src));
      assert.deepEqual(rendered, ids.map(id => stored[id].image));
      assert.ok(rendered.every(image => image.startsWith('data:image/jpeg;base64,')));
      await click(page, 'record-evidence');
      assert.equal((await state(page)).fields['evidence.bridge'], 'observed');
      return { durableImages: ids, recordedAfterRetry: true };
    });

    await run('partial-visit', async page => {
      await bridge(page);
      await click(page, 'evidence-bridge');
      await click(page, 'record-evidence');
      await click(page, 'investigate');
      await click(page, 'explain');
      assert.equal((await state(page)).nodeId, 'j.explain');
      await click(page, 'editor');
      const caption = 'The bridge water looked brown. We still want to know what caused it.';
      await page.locator('[data-card-source="1"]').selectOption('record.bridge.current_round.v1');
      await page.locator('[data-card-caption="1"]').fill(caption);
      await click(page, 'save-explanation');
      await click(page, 'return-bridge');
      await walkFinished(page);
      await click(page, 'finish');
      const saved = await state(page);
      assert.equal(saved.nodeId, 'j.end_saved');
      assert.equal(saved.fields['explanation.cards'][0].caption, caption);
      await page.reload();
      await ready(page);
      await click(page, 'begin');
      await page.getByText('No cover installed', { exact: true }).waitFor();
      await click(page, 'resume');
      await walkFinished(page);
      const resumed = await state(page);
      assert.equal(resumed.nodeId, 'j.return_card');
      assert.equal(resumed.fields['evidence.bridge'], 'observed');
      assert.equal(resumed.fields['evidence.upper'], 'unseen');
      assert.equal(resumed.fields['evidence.path'], 'unseen');
      assert.equal(resumed.fields['interview.heard'], false);
      assert.equal(resumed.fields['world.coverInstalled'], false);
      assert.deepEqual(resumed.fields['model.trials'], []);
      assert.deepEqual(resumed.fields['followup.observations'], []);
      assert.equal(resumed.fields['followup.card'], null);
      assert.deepEqual(resumed.fields['explanation.cards'], saved.fields['explanation.cards']);
      return { savedNode: saved.nodeId, resumedNode: resumed.nodeId, trials: 0, installed: false };
    });

    await run('unresolved-visit', async page => {
      await bridge(page);
      await click(page, 'evidence-bridge');
      await click(page, 'record-evidence');
      await click(page, 'investigate');
      await click(page, 'explain');
      await click(page, 'save-unresolved');
      const question = 'Could something else upstream make the stream brown?';
      await page.locator('textarea[data-draft="openQuestion"]').fill(question);
      await click(page, 'confirm-unresolved');
      const saved = await state(page);
      assert.equal(saved.nodeId, 'j.end_unresolved');
      assert.equal(saved.fields['resume.note'], question);
      assert.equal(saved.fields['resume.nodeId'], 'j.explain');
      assert.equal(saved.fields['session.phase'], 'unresolved');
      assert.equal(entries(saved, 'UNRESOLVED_SAVED').length, 1);
      await page.reload();
      await ready(page);
      await click(page, 'begin');
      await page.getByText(question, { exact: true }).waitFor();
      await shot(page, 'unresolved-visit');
      await click(page, 'resume');
      await walkFinished(page);
      const resumed = await state(page);
      assert.equal(resumed.nodeId, 'j.explain');
      assert.equal(resumed.fields['resume.note'], question);
      assert.equal(resumed.fields['evidence.bridge'], 'observed');
      assert.equal(resumed.fields['evidence.upper'], 'unseen');
      assert.equal(resumed.fields['evidence.path'], 'unseen');
      assert.equal(resumed.fields['world.coverInstalled'], false);
      assert.deepEqual(resumed.fields['model.trials'], []);
      assert.equal(resumed.fields['followup.card'], null);
      return { savedNode: saved.nodeId, resumedNode: resumed.nodeId, question, trials: 0, installed: false };
    });

    const malformed = '{"fields": ["incomplete"';
    await run('malformed-export', async page => {
      await click(page, 'begin');
      await page.getByRole('dialog', { name: 'A saved visit needs attention.' }).waitFor();
      const [download] = await Promise.all([page.waitForEvent('download'), click(page, 'export')]);
      const data = JSON.parse(await readFile(await download.path(), 'utf8'));
      assert.equal(data.journey.unreadableSavedText, malformed);
      assert.equal(await raw(page), malformed);
      return { filename: download.suggestedFilename(), rawTextPreserved: true };
    }, { seed: { [journeyKey]: malformed } });

    await run('narrow-keyboard', async page => {
      const settings = action(page, 'settings');
      await settings.focus();
      await page.keyboard.press('Enter');
      const dialog = page.getByRole('dialog');
      await dialog.waitFor();
      const focused = () => page.evaluate(() => document.activeElement?.dataset.action);
      assert.equal(await focused(), 'close');
      await page.keyboard.press('Shift+Tab');
      assert.equal(await focused(), 'new-confirm');
      await page.keyboard.press('Tab');
      assert.equal(await focused(), 'close');
      const widths = () => page.evaluate(() => ({
        document: document.documentElement.scrollWidth,
        viewport: innerWidth,
        dialog: document.querySelector('.modal')?.scrollWidth,
        dialogClient: document.querySelector('.modal')?.clientWidth,
      }));
      const modal = await widths();
      assert.ok(modal.dialog <= modal.dialogClient, JSON.stringify(modal));
      assert.ok(modal.document <= modal.viewport, JSON.stringify(modal));
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'detached' });
      assert.equal(await focused(), 'settings');
      await bridge(page);
      await click(page, 'evidence-bridge');
      await page.locator('.evidence-photo img').first().waitFor();
      const evidence = await widths();
      assert.ok(evidence.dialog <= evidence.dialogClient, JSON.stringify(evidence));
      assert.ok(evidence.document <= evidence.viewport, JSON.stringify(evidence));
      await shot(page, 'mobile-evidence');
      return { focusReturned: true, viewport: modal.viewport, documentWidth: evidence.document, evidenceDialogWidth: evidence.dialog };
    }, { viewport: { width: 390, height: 844 } });
  }

  if (!process.argv.includes('--entry-only')) {
    const fixture = JSON.parse(await readFile(join(artifacts, 'model-checkpoint.json'), 'utf8'));
    const checkpoint = JSON.parse(fixture[journeyKey]);
    assert.equal(checkpoint.nodeId, 'j.model');
    assert.ok(checkpoint.fields['model.trials'].length >= 1);
    const model = { seed: fixture, reduced: false };

    const foreignLayout = 'valley-layout-incompatible-fixture';
    const foreign = checkpoint.acceptedEvents.reduce((snapshot, command) => {
      const input = command.event === 'SESSION_OPENED' ? { ...command.input, layoutVersion: foreignLayout } : command.input;
      return applyEvent(snapshot, { id: command.id, event: command.event, input }, command.context);
    }, createInitialState());
    const foreignRaw = JSON.stringify(foreign);
    const loaded = createJourneyStore({ getItem: () => foreignRaw });
    assert.equal(loaded.loadError, null);
    assert.deepEqual(loaded.state, foreign);
    assert.equal(loaded.state.fields['session.layoutVersion'], foreignLayout);
    await run('incompatible-scene', async page => {
      await click(page, 'begin');
      const dialog = page.getByRole('dialog', { name: 'This record does not fit the current scene.' });
      await dialog.waitFor();
      assert.equal(await action(page, 'run-trial').count(), 0);
      assert.equal(await page.locator('.model-badge').count(), 0);
      const [download] = await Promise.all([page.waitForEvent('download'), click(page, 'export')]);
      const data = JSON.parse(await readFile(await download.path(), 'utf8'));
      assert.deepEqual(data.journey, foreign);
      assert.equal(await raw(page), foreignRaw);
      return { preservedRevision: foreign.revision, layout: foreignLayout, exportMatches: true };
    }, { seed: { ...fixture, [journeyKey]: foreignRaw } });

    await run('paused-model', async page => {
      const trial = await startDifferentCandidate(page);
      await click(page, 'pause');
      assert.equal((await state(page)).nodeId, 'j.end_paused');
      await page.reload();
      await ready(page);
      await click(page, 'begin');
      await click(page, 'resume');
      await walkFinished(page);
      await assertPreviousResult(page, trial);
      return { retainedTrial: trial.before.fields['model.latestTrialId'], uncompletedCandidate: trial.position };
    }, model);

    await run('interrupted-model', async page => {
      const trial = await startDifferentCandidate(page);
      await arm(page, { key: journeyKey, event: 'INTERRUPTED_TRIAL_RECOVERED' });
      await page.reload();
      await ready(page);
      assert.equal((await state(page)).fields['model.activeRunId'], trial.runId);
      await click(page, 'begin');
      await page.getByRole('dialog', { name: 'A saved visit needs attention.' }).waitFor();
      assert.equal(await action(page, 'run-trial').count(), 0);
      const [fault] = await rejected(page);
      assert.equal(fault?.event, 'INTERRUPTED_TRIAL_RECOVERED');
      await click(page, 'retry-recovery');
      await walkFinished(page);
      await assertPreviousResult(page, trial);
      const recoveries = entries(await state(page), fault.event);
      assert.equal(recoveries.length, 1);
      assert.equal(recoveries[0].id, fault.id);
      await shot(page, 'interrupted-model');
      return { retainedTrial: trial.before.fields['model.latestTrialId'], uncompletedCandidate: trial.position, retriedRecovery: true };
    }, model);

    for (const [control, event] of [['pause', 'PAUSE_SAVED'], ['cancel-trial', 'TRIAL_CANCELLED']]) {
      await run(`failed-${control}`, async page => {
        const trial = await startDifferentCandidate(page);
        await arm(page, { key: journeyKey, event });
        await click(page, control);
        assert.equal((await state(page)).fields['model.activeRunId'], trial.runId);
        assert.equal((await state(page)).nodeId, 'j.model');
        assert.equal(await action(page, control).isVisible(), true);
        assert.equal(await action(page, 'cancel-trial').isVisible(), true);
        const [fault] = await rejected(page);
        assert.equal(fault?.event, event);
        await page.waitForFunction(() => {
          const progress = parseFloat(document.querySelector('.trial-progress > i').style.width);
          return progress > 10 && progress < 95;
        });
        const progress = () => page.locator('.trial-progress > i').evaluate(bar => parseFloat(bar.style.width));
        const first = await progress();
        await page.waitForFunction(first => parseFloat(document.querySelector('.trial-progress > i').style.width) > first, first);
        await click(page, control);
        const committed = await state(page);
        assert.equal(committed.fields['model.activeRunId'], null);
        assert.equal(committed.nodeId, control === 'pause' ? 'j.end_paused' : 'j.model');
        assert.deepEqual(committed.fields['model.trials'], trial.before.fields['model.trials']);
        const accepted = entries(committed, event).slice(entries(trial.before, event).length);
        assert.equal(accepted.length, 1);
        assert.equal(accepted[0].id, fault.id);
        return { animationContinued: true, sameCommandId: true, committed: event, runId: trial.runId };
      }, model);
    }

    await run('failed-trial-completion', async page => {
      const trial = await startDifferentCandidate(page);
      await arm(page, { key: journeyKey, event: 'TRIAL_COMPLETED' });
      await action(page, 'retry-trial-save').waitFor();
      const failed = await state(page);
      assert.equal(failed.fields['model.activeRunId'], trial.runId);
      assert.deepEqual(failed.fields['model.trials'], trial.before.fields['model.trials']);
      assert.equal(await action(page, 'cancel-trial').isVisible(), true);
      const [fault] = await rejected(page);
      assert.equal(fault?.event, 'TRIAL_COMPLETED');
      assert.equal(fault.input.runId, trial.runId);
      const savedFrame = JSON.parse(await raw(page, mediaKey))[`trial.${fault.id}`];
      assert.ok(savedFrame?.image.startsWith('data:image/jpeg;base64,'));
      await click(page, 'retry-trial-save');
      await action(page, 'run-trial').waitFor();
      const committed = await state(page);
      const newTrials = committed.fields['model.trials'].slice(trial.before.fields['model.trials'].length);
      assert.equal(newTrials.length, 1);
      assert.equal(newTrials[0].trialId, fault.id);
      assert.equal(newTrials[0].runId, trial.runId);
      const completion = entries(committed, 'TRIAL_COMPLETED').filter(command => command.input.runId === trial.runId);
      assert.deepEqual(completion.map(command => command.id), [fault.id]);
      assert.equal((await action(page, 'retry-trial-save').count()), 0);
      assert.equal(committed.fields['world.coverInstalled'], false);
      await page.reload();
      await ready(page);
      assert.deepEqual((await state(page)).fields['model.trials'], committed.fields['model.trials']);
      return { runId: trial.runId, sameCommandId: true, newCompletedTrials: newTrials.length };
    }, model);
  }
} finally {
  await browser.close();
  const report = { url, build, passed: results.filter(result => result.passed).length, failed: results.filter(result => !result.passed).length, results };
  await writeFile(join(artifacts, 'resilience-results.json'), JSON.stringify(report, null, 2));
  console.log(`${report.passed} passed, ${report.failed} failed`);
  if (report.failed) process.exitCode = 1;
}
