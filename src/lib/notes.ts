export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  favorite: boolean;
  updatedAt: string;
}
export const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export function searchNotes(
  notes: Note[],
  query: string,
  tag: string,
  favoritesOnly: boolean,
) {
  const terms = normalize(query.trim()).split(/\s+/).filter(Boolean);
  return notes
    .filter(
      (n) =>
        (!favoritesOnly || n.favorite) &&
        (!tag || n.tags.includes(tag)) &&
        terms.every((term) =>
          normalize(`${n.title} ${n.content} ${n.tags.join(" ")}`).includes(
            term,
          ),
        ),
    )
    .sort(
      (a, b) =>
        Date.parse(b.updatedAt) - Date.parse(a.updatedAt) ||
        a.title.localeCompare(b.title),
    );
}
export function wordCount(content: string) {
  return content.trim() ? content.trim().split(/\s+/).length : 0;
}
export function isNote(value: unknown): value is Note {
  if (typeof value !== "object" || value === null) return false;
  const n = value as Record<string, unknown>;
  return (
    typeof n.id === "string" &&
    n.id.length > 0 &&
    n.id.length <= 100 &&
    typeof n.title === "string" &&
    n.title.trim().length > 0 &&
    n.title.length <= 160 &&
    typeof n.content === "string" &&
    n.content.length <= 30000 &&
    Array.isArray(n.tags) &&
    n.tags.length <= 20 &&
    n.tags.every(
      (t) => typeof t === "string" && t.length > 0 && t.length <= 40,
    ) &&
    typeof n.favorite === "boolean" &&
    typeof n.updatedAt === "string" &&
    !Number.isNaN(Date.parse(n.updatedAt))
  );
}
export function parseBackup(raw: string): Note[] {
  if (raw.length > 1000000)
    throw new Error("O arquivo excede o limite de 1 MB.");
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("O arquivo não contém JSON válido.");
  }
  const obj = data as { version?: unknown; notes?: unknown };
  if (
    !obj ||
    obj.version !== 1 ||
    !Array.isArray(obj.notes) ||
    obj.notes.length > 500 ||
    !obj.notes.every(isNote)
  )
    throw new Error("Este não é um backup válido do DevNotes.");
  const notes = obj.notes as Note[];
  if (new Set(notes.map((n) => n.id)).size !== notes.length)
    throw new Error("O backup contém identificadores repetidos.");
  return notes;
}
export function mergeNotes(current: Note[], incoming: Note[]): Note[] {
  const map = new Map(current.map((n) => [n.id, n]));
  for (const note of incoming) {
    const existing = map.get(note.id);
    if (
      !existing ||
      Date.parse(note.updatedAt) > Date.parse(existing.updatedAt)
    )
      map.set(note.id, note);
  }
  if (map.size > 500)
    throw new Error(
      "O limite é de 500 notas. Exporte e organize sua biblioteca antes de importar.",
    );
  return [...map.values()];
}
