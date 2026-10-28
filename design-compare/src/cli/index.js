import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { FILES } from '../domain/artifacts.js';
import { activityStore } from '../activity/index.js';
import { createApplication } from '../application.js';
import { parseInvocation, help } from './parser.js';
import { failure } from './recovery.js';
import { nextActions, jsonOutput, textOutput, errorOutput } from './presentation.js';
import { loadProject } from '../project.js';

export async function runCli(args, { app, stdout = console.log, stderr = console.error } = {}) {
  let json = args.includes('--json'), context = { stage: 'arguments' }, operation;
  try {
    const invocation = parseInvocation(args);
    if (invocation.help) { stdout(help); return 0; }
    app ??= createApplication();
    const { name, command, request, values } = invocation;
    json = !!values.json;
    context = { stage: command.stage(request), store: values.store };
    if (name === 'history') {
      const history = await command.execute(app, request); stdout(json ? JSON.stringify(history) : textOutput(name, history)); return 0;
    }
    operation = await activityStore(values.store).begin({ command: name, args, taskId: values.task });
    const result = await command.execute(app, name === 'brief' ? { ...request, operation } : request);
    const output = name === 'compare' ? { ...result, nextActions: nextActions(result, args) } : result;
    const policyGate = name === 'motion' && values.strict && ['motion', 'instant'].includes(result.expectation);
    const exitCode = result.status === 'error' || (policyGate && result.status === 'inconclusive') ? 2 : result.status === 'fail' || (policyGate && result.status === 'review') ? 1 : 0;
    const projected = jsonOutput(name, output, values);
    if (name === 'motion') {
      const { screenshots, ...summary } = projected;
      Object.assign(projected, summary);
      delete projected.screenshots;
      const images = { before: await operation.image('before.png', screenshots.before, '동작 전') };
      for (const i of [1, 2, 3, 4]) if (screenshots[`frame-${i}`]) images[`frame-${i}`] = await operation.image(`frame-${i}.png`, screenshots[`frame-${i}`], `동작 중 ${i}`);
      images.after = await operation.image('after.png', screenshots.after, '동작 후');
      projected.evidence = { ...summary.evidence, images };
    }
    if (name === 'compare') {
      const images = {};
      for (const [key, label] of [['reference', '기준 화면'], ['candidate', '개발 화면'], ['diff', '차이 화면']]) images[key] = await operation.image(FILES[key], await readFile(join(result.directory, FILES[key])), label);
      const reportPath = await operation.file(FILES.html, await readFile(result.reportPath));
      await operation.file(FILES.report, await readFile(result.jsonPath));
      await operation.file(FILES.repair, await readFile(result.repairPath));
      projected.evidence = { images, reportPath };
    }
    if (name === 'inspect' && projected.evidence?.images) {
      const images = {};
      for (const [key, path] of Object.entries(projected.evidence.images)) images[key] = await operation.image(`${key}.png`, await readFile(path), { reference: '기준 화면', candidate: '개발 화면', diff: '차이 화면' }[key] ?? key);
      projected.evidence = { ...projected.evidence, images };
    }
    if (name === 'register') projected.evidence = { images: { reference: await operation.image('reference.png', await readFile(join(result.directory, 'reference.png')), '등록한 기준') } };
    const delivered = await operation.finish(projected, { exitCode, text: json ? null : textOutput(name, output) });
    stdout(json ? JSON.stringify(delivered) : `${textOutput(name, output)}\n호출 기록: ${delivered.activity.path}`);
    return exitCode;
  } catch (error) {
    const failed = failure(error, context);
    if (!operation && args.length && args[0] !== 'history') {
      const storeIndex = args.indexOf('--store');
      try {
        const requestedStore = args.find(value => value.startsWith('--store='))?.slice(8) ?? (storeIndex >= 0 && !args[storeIndex + 1]?.startsWith('--') ? args[storeIndex + 1] : loadProject().store);
        operation = await activityStore(requestedStore).begin({ command: args[0], args });
      } catch { /* Storage/configuration failures stay on the normal error channel. */ }
    }
    let result = failed;
    if (operation) {
      try { result = await operation.finish(failed, { exitCode: 2, text: json ? null : errorOutput(failed) }); }
      catch (journalError) {
        await operation.abort();
        result = failure(new Error(`호출 기록 저장 실패: ${journalError.message}. 원래 오류: ${failed.message}`), { stage: 'activity', store: context.store });
      }
    }
    if (json) stdout(JSON.stringify(result)); else stderr(`${errorOutput(result)}${result.activity ? `\n호출 기록: ${result.activity.path}` : ''}`);
    return 2;
  }
}
