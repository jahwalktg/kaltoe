/* 누끼 엔진(브라우저 안에서만 돎). 사진은 보내지 않고 엔진 파일만 받는다 */
import * as ort from 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/ort.webgpu.min.mjs';
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/';
ort.env.wasm.numThreads = self.crossOriginIsolated ? Math.min(4, navigator.hardwareConcurrency || 1) : 1;
ort.env.logLevel = 'error';
const M = {
  fast: { url: 'https://huggingface.co/Xenova/modnet/resolve/main/onnx/model.onnx', mb: 25.9, mean: [.5, .5, .5], std: [.5, .5, .5] },
  fine: { url: 'https://huggingface.co/studioludens/birefnet-lite-512/resolve/main/onnx/model_fp16.onnx', mb: 98.5, mean: [.485, .456, .406], std: [.229, .224, .225], gpu: true, sig: true }
};
const S = {};
async function bytes(m, id) {
  let cache;
  try { cache = await caches.open('sonjil-models-1'); const h = await cache.match(m.url); if (h) return new Uint8Array(await h.arrayBuffer()); } catch (e) { /* 캐시를 못 쓰면 매번 받음 */ }
  const r = await fetch(m.url); if (!r.ok) throw new Error('엔진을 받지 못했습니다(' + r.status + ')');
  const total = +r.headers.get('content-length') || m.mb * 1e6, rd = r.body.getReader(), ch = []; let n = 0;
  for (; ;) { const { done, value } = await rd.read(); if (done) break; ch.push(value); n += value.length; postMessage({ id, prog: Math.min(1, n / total), t: `누끼 엔진 받는 중 ${Math.round(n / 1e6)}MB (처음 한 번만)` }); }
  const b = new Blob(ch); try { await cache.put(m.url, new Response(b)); } catch (e) { /* 저장 공간 없음 */ }
  return new Uint8Array(await b.arrayBuffer());
}
const cpu = (b, k) => ort.InferenceSession.create(b, { executionProviders: ['wasm'], graphOptimizationLevel: k === 'fine' ? 'basic' : 'all' });
async function load(k, id) {
  if (S[k]) return S[k];
  const m = M[k], b = await bytes(m, id); postMessage({ id, t: '엔진 준비 중' }); let ep = 'wasm', s;
  if (m.gpu && navigator.gpu && !location.search.includes('cpu')) try { const a = await navigator.gpu.requestAdapter(); if (a && a.features.has('shader-f16')) ep = 'webgpu'; } catch (e) { /* GPU 없음 */ }
  if (ep === 'webgpu') try { s = await ort.InferenceSession.create(b, { executionProviders: ['webgpu'] }); } catch (e) { ep = 'wasm'; }
  if (!s) s = await cpu(b, k);
  return S[k] = { s, ep, m };
}
let chain = Promise.resolve();
onmessage = e => { chain = chain.then(() => run(e.data)); };
async function run({ id, k, rgba, w, h }) {
  try {
    let L = await load(k, id); const { m } = L, t = new Float32Array(3 * w * h);
    for (let c = 0; c < 3; c++) for (let i = 0; i < w * h; i++) t[c * w * h + i] = (rgba[i * 4 + c] / 255 - m.mean[c]) / m.std[c];
    const go = async () => { const o = await L.s.run({ [L.s.inputNames[0]]: new ort.Tensor('float32', t, [1, 3, h, w]) }); const v = o[L.s.outputNames[L.s.outputNames.length - 1]]; return { d: await v.getData(), dims: v.dims }; };
    postMessage({ id, t: L.ep === 'wasm' && k === 'fine' ? '배경을 찾는 중 — 그래픽 가속이 없어 오래 걸릴 수 있습니다' : '배경을 찾는 중' });
    const t0 = performance.now(); let r;
    try { r = await go(); }
    catch (er) { if (L.ep !== 'webgpu') throw er; postMessage({ id, t: '그래픽 가속이 안 되어 느린 방식으로 다시 하는 중' }); L = S[k] = { m, ep: 'wasm', s: await cpu(await bytes(m, id), k) }; r = await go(); }
    const n = r.dims.length, oh = r.dims[n - 2], ow = r.dims[n - 1], a = new Float32Array(ow * oh);
    for (let i = 0; i < a.length; i++) a[i] = m.sig ? 1 / (1 + Math.exp(-r.d[i])) : r.d[i];
    postMessage({ id, a, w: ow, h: oh, ms: performance.now() - t0, ep: L.ep }, [a.buffer]);
  } catch (er) { postMessage({ id, err: String((er && er.message) || er) }); }
}
