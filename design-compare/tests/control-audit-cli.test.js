import test from "node:test";
import assert from "node:assert/strict";
import { runCli } from "../src/cli/index.js";
import { auditUi } from "../src/audit/ui.js";
import { createHubServer } from "../hub/server.js";
import { createServer } from "node:http";

test("audit passes its project policy to the UI consistency scanner and fails only in strict mode", async () => {
  const requests = [];
  const app = {
    auditUi: async (request) => {
      requests.push(request);
      return { schemaVersion: 1, status: "fail", findings: [{ kind: "native-date-picker", name: "예약일" }] };
    },
  };
  const output = [];
  const exit = await runCli([
    "audit", "--url", "http://127.0.0.1:4184", "--selector", "#app",
    "--allow", "[data-ds-native=allow]", "--strict", "--json",
  ], { app, stdout: (value) => output.push(JSON.parse(value)) });

  assert.equal(exit, 1);
  assert.deepEqual(requests, [{
    url: "http://127.0.0.1:4184",
    selector: "#app",
    allow: ["[data-ds-native=allow]"],
    strict: true,
    theme: "light",
    store: requests[0].store,
  }]);
  assert.equal(output[0].status, "fail");
});

test("audit waits for a routed tool and reports browser-native controls while honoring an allow marker", async () => {
  const server = createHubServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${server.address().port}/design-library/#/accessibility/controls`;
  try {
    const result = await auditUi({
      url,
      selector: "#control-audit-sample",
      allow: ["[data-ds-native=allow]"],
      strict: true,
    });
    assert.equal(result.status, "fail");
    assert.deepEqual(result.findings.find(({ kind }) => kind === "native-file-input"), {
      kind: "native-file-input",
      category: "platform",
      name: "기본 파일 선택",
      target: 'input[aria-label="기본 파일 선택"]',
      severity: "error",
    });
    assert.ok(result.findings.some(({ kind }) => kind === "native-scrollbar"));
    assert.equal(result.findings.some(({ name }) => name === "의도적으로 허용한 기본 select"), false);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("audit works with strict CSP and includes a styled date input selected as the root", async () => {
  const server = createServer((_request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/html', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'" });
    response.end('<input id="booking" type="date" aria-label="예약일" style="appearance:none">');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const result = await auditUi({ url: `http://127.0.0.1:${server.address().port}/`, selector: '#booking', strict: true });
    assert.equal(result.status, 'fail');
    assert.ok(result.findings.some(({ kind }) => kind === 'native-date-picker'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
