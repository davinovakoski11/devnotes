"use client";
import { useState } from "react";
import Markdown from "react-markdown";
import { Eye, Save, X } from "lucide-react";
import type { Note } from "@/lib/notes";
export default function NoteEditor({
  note,
  onSave,
  onCancel,
}: {
  note: Note;
  onSave: (note: Note) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(note.title),
    [content, setContent] = useState(note.content),
    [tags, setTags] = useState(note.tags.join(", ")),
    [preview, setPreview] = useState(false);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...note,
      title: title.trim(),
      content: content.trim(),
      tags: [
        ...new Set(
          tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        ),
      ].slice(0, 20),
      updatedAt: new Date().toISOString(),
    });
  }
  return (
    <form className="note-editor" onSubmit={submit}>
      <div className="editor-bar">
        <span>ESCREVA. CONECTE. EVOLUA.</span>
        <button
          type="button"
          className="icon-button"
          onClick={onCancel}
          aria-label="Cancelar edição"
        >
          <X size={18} />
        </button>
      </div>
      <label htmlFor="note-title">Título</label>
      <input
        id="note-title"
        className="title-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={160}
        placeholder="Uma ideia que vale guardar..."
        required
        autoFocus
      />
      <label htmlFor="note-tags">Tags separadas por vírgula</label>
      <input
        id="note-tags"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        maxLength={800}
        placeholder="Vue.js, Laravel, Aprendizados"
      />
      <div className="markdown-label">
        <label htmlFor="note-content">Conteúdo em Markdown</label>
        <button
          className="text-button"
          type="button"
          onClick={() => setPreview(!preview)}
        >
          <Eye size={14} />
          {preview ? "Voltar ao editor" : "Pré-visualizar"}
        </button>
      </div>
      {preview ? (
        <div className="markdown editor-preview">
          <Markdown>
            {content || "*Comece a escrever para visualizar sua nota.*"}
          </Markdown>
        </div>
      ) : (
        <textarea
          id="note-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={30000}
          placeholder={"# O que aprendi hoje\n\nEscreva sua nota..."}
          required
          rows={15}
        />
      )}
      <div className="editor-bottom">
        <small>
          {content.length.toLocaleString("pt-BR")} / 30.000 caracteres
        </small>
        <div>
          <button className="secondary-button" type="button" onClick={onCancel}>
            Cancelar
          </button>
          <button
            className="primary-button"
            type="submit"
            disabled={!title.trim() || !content.trim()}
          >
            <Save size={15} />
            Salvar nota
          </button>
        </div>
      </div>
    </form>
  );
}
