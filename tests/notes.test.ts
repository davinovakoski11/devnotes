import test from "node:test";
import assert from "node:assert/strict";
import {
  parseBackup,
  mergeNotes,
  searchNotes,
  wordCount,
  isNote,
} from "../src/lib/notes";
import { initialNotes } from "../src/lib/seed";

test("busca combina palavras, ignora acentos e respeita tags e favoritos", () => {
  assert.deepEqual(
    searchNotes(initialNotes, "validacao laravel", "Laravel", true).map(
      (n) => n.id,
    ),
    ["laravel-validation"],
  );
  assert.equal(
    searchNotes(initialNotes, "validacao", "Vue.js", false).length,
    0,
  );
});
test("backup exportado pode ser importado sem perder conteúdo", () => {
  assert.deepEqual(
    parseBackup(JSON.stringify({ version: 1, notes: initialNotes })),
    initialNotes,
  );
});
test("importação rejeita JSON, versões e registros inválidos sem apagar o estado atual", () => {
  assert.throws(() => parseBackup("invalid"), /JSON/);
  assert.throws(() => parseBackup('{"version":2,"notes":[]}'), /válido/);
  assert.throws(
    () =>
      parseBackup(
        JSON.stringify({
          version: 1,
          notes: [{ ...initialNotes[0], title: "" }],
        }),
      ),
    /válido/,
  );
  assert.throws(() => parseBackup("x".repeat(1000001)), /1 MB/);
});
test("backup com identificadores duplicados é recusado", () => {
  assert.throws(
    () =>
      parseBackup(
        JSON.stringify({
          version: 1,
          notes: [initialNotes[0], initialNotes[0]],
        }),
      ),
    /repetidos/,
  );
});
test("mesclagem preserva a versão local mais recente e incorpora novas notas", () => {
  const current = {
    ...initialNotes[0],
    updatedAt: "2026-10-28T10:00:00Z",
    content: "Versão local",
  };
  const incoming = {
    ...initialNotes[0],
    updatedAt: "2026-10-27T10:00:00Z",
    content: "Versão antiga",
  };
  const merged = mergeNotes([current], [incoming, initialNotes[1]]);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].content, "Versão local");
});
test("mesclagem substitui a versão antiga pela nota importada mais recente", () => {
  const incoming = {
    ...initialNotes[0],
    updatedAt: "2026-10-29T10:00:00Z",
    content: "Versão importada",
  };
  assert.equal(
    mergeNotes([initialNotes[0]], [incoming])[0].content,
    "Versão importada",
  );
});
test("validação limita tags e rejeita datas que não podem ser ordenadas", () => {
  assert.equal(isNote({ ...initialNotes[0], tags: ["x".repeat(41)] }), false);
  assert.equal(isNote({ ...initialNotes[0], updatedAt: "ontem" }), false);
});
test("contagem lida com texto vazio e espaços repetidos", () => {
  assert.equal(wordCount("  "), 0);
  assert.equal(wordCount("Uma\nnota   técnica"), 3);
});

test("ordena datas pelo instante real mesmo com fusos diferentes", () => {
  const earlier = {
    ...initialNotes[0],
    id: "earlier",
    updatedAt: "2026-10-24T02:00:00+03:00",
  };
  const later = {
    ...initialNotes[1],
    id: "later",
    updatedAt: "2026-10-24T00:00:00Z",
  };
  assert.deepEqual(
    searchNotes([earlier, later], "", "", false).map((n) => n.id),
    ["later", "earlier"],
  );
});
