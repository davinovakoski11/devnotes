"use client";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import {
  BookOpen,
  Search,
  Star,
  Plus,
  ArrowUpRight,
  Download,
  Upload,
  Pencil,
  Trash2,
  FileText,
  Hash,
  X,
  ArrowLeft,
  Code2,
  Check,
  CircleHelp,
} from "lucide-react";
import { initialNotes } from "@/lib/seed";
import {
  searchNotes,
  wordCount,
  parseBackup,
  mergeNotes,
  isNote,
  type Note,
} from "@/lib/notes";
import NoteEditor from "./NoteEditor";
const STORAGE = "devnotes:library:v1";
export default function Library() {
  const [notes, setNotes] = useState<Note[]>(initialNotes),
    [query, setQuery] = useState(""),
    [tag, setTag] = useState(""),
    [favoritesOnly, setFavoritesOnly] = useState(false),
    [activeId, setActiveId] = useState(initialNotes[0].id),
    [draft, setDraft] = useState<Note | null>(null),
    [notice, setNotice] = useState(""),
    [loaded, setLoaded] = useState(false),
    [showHelp, setShowHelp] = useState(false);
  const helpRef = useRef<HTMLDialogElement>(null),
    searchRef = useRef<HTMLInputElement>(null),
    importRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) {
        const stored = parseBackup(raw);
        setNotes(stored);
        setActiveId(stored[0]?.id || "");
      }
    } catch {
      setNotice(
        "Não foi possível ler o arquivo local. Exporte seus dados antes de substituir o conteúdo.",
      );
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    function shortcut(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes(target.tagName) &&
        !target.isContentEditable
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, []);
  useEffect(() => {
    if (showHelp) helpRef.current?.showModal();
  }, [showHelp]);
  const filtered = searchNotes(notes, query, tag, favoritesOnly),
    active = notes.find((n) => n.id === activeId);
  const tags = [...new Set(notes.flatMap((n) => n.tags))].sort(),
    favorites = notes.filter((n) => n.favorite).length;
  function commit(next: Note[]) {
    try {
      localStorage.setItem(
        STORAGE,
        JSON.stringify({ version: 1, notes: next }),
      );
      setNotes(next);
      return true;
    } catch {
      setNotice(
        "Sem espaço para salvar no navegador. Exporte um backup antes de continuar.",
      );
      return false;
    }
  }
  function select(id: string) {
    if (
      draft &&
      !window.confirm("Sair da edição e descartar as alterações não salvas?")
    )
      return;
    setDraft(null);
    setActiveId(id);
  }
  function create() {
    if (draft && !window.confirm("Descartar a edição atual?")) return;
    if (notes.length >= 500) {
      setNotice("Limite de 500 notas atingido.");
      return;
    }
    setDraft({
      id: crypto.randomUUID(),
      title: "",
      content: "",
      tags: [],
      favorite: false,
      updatedAt: new Date().toISOString(),
    });
    setActiveId("");
  }
  function save(note: Note) {
    if (!isNote(note)) {
      setNotice("Confira o título e mantenha cada tag com até 40 caracteres.");
      return;
    }
    const next = notes.some((n) => n.id === note.id)
      ? notes.map((n) => (n.id === note.id ? note : n))
      : [note, ...notes];
    if (commit(next)) {
      setDraft(null);
      setActiveId(note.id);
      setNotice("Nota salva neste navegador.");
    }
  }
  function favorite(note: Note) {
    commit(
      notes.map((n) =>
        n.id === note.id ? { ...n, favorite: !n.favorite } : n,
      ),
    );
  }
  function remove(note: Note) {
    if (
      !window.confirm(
        `Excluir “${note.title}”? Esta ação não pode ser desfeita. Você pode exportar um backup antes.`,
      )
    )
      return;
    const next = notes.filter((n) => n.id !== note.id);
    if (commit(next)) {
      setActiveId(next[0]?.id || "");
      setNotice("Nota excluída.");
    }
  }
  function exportBackup() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ version: 1, notes }, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "devnotes-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    setNotice("Backup exportado.");
  }
  async function importBackup(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      if (file.size > 1000000)
        throw new Error("Escolha um arquivo de até 1 MB.");
      const incoming = parseBackup(await file.text());
      if (commit(mergeNotes(notes, incoming)))
        setNotice(
          `${incoming.length} notas processadas. Versões mais recentes foram preservadas.`,
        );
    } catch (err) {
      setNotice(
        err instanceof Error
          ? err.message
          : "Não foi possível importar o arquivo.",
      );
    }
  }
  return (
    <div className="library-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="DevNotes início">
          <span>
            <Code2 size={22} />
          </span>
          devnotes<span className="brand-period">.</span>
        </a>
        <p className="sidebar-caption">SEU SEGUNDO CÉREBRO DE DEV</p>
        <button className="new-note" onClick={create} disabled={!loaded}>
          <Plus size={17} />
          Nova nota<span>＋</span>
        </button>
        <div className="nav-label">BIBLIOTECA</div>
        <nav aria-label="Biblioteca">
          <button
            className={`nav-item ${!favoritesOnly && !tag ? "active" : ""}`}
            onClick={() => {
              setFavoritesOnly(false);
              setTag("");
            }}
          >
            <BookOpen size={17} />
            Todas as notas
            <span>{notes.length.toString().padStart(2, "0")}</span>
          </button>
          <button
            className={`nav-item ${favoritesOnly ? "active" : ""}`}
            onClick={() => {
              setFavoritesOnly(!favoritesOnly);
              setTag("");
            }}
          >
            <Star size={17} />
            Favoritas<span>{favorites.toString().padStart(2, "0")}</span>
          </button>
        </nav>
        <div className="nav-label tags-label">EXPLORAR POR TAG</div>
        <div className="tag-navigation">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTag(tag === t ? "" : t);
                setFavoritesOnly(false);
              }}
              className={tag === t ? "selected" : ""}
            >
              <Hash size={13} />
              {t}
              <span>{notes.filter((n) => n.tags.includes(t)).length}</span>
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="local-card">
            <span className="local-dot" />
            Seu conhecimento, com você.
            <p>
              Notas salvas neste navegador.
              <br />
              Exporte um backup para guardar.
            </p>
            <button onClick={exportBackup}>
              <Download size={13} />
              Exportar biblioteca
            </button>
          </div>
          <button className="help-link" onClick={() => setShowHelp(true)}>
            <CircleHelp size={15} />
            Como funciona
          </button>
          <div className="sidebar-author">
            <span>DN</span>
            <div>
              <strong>Espaço pessoal</strong>
              <small>Aprender é construir.</small>
            </div>
            <ArrowUpRight size={16} />
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <span>
            Biblioteca<span className="breadcrumb">/</span>
            <strong>
              {favoritesOnly ? "Favoritas" : tag || "Todas as notas"}
            </strong>
          </span>
          <a
            href="https://github.com/davinovakoski11/devnotes"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver no GitHub
            <ArrowUpRight size={14} />
          </a>
        </header>
        <section className="hero">
          <div>
            <div className="eyebrow">
              <span />
              APRENDIZADO CONTÍNUO
            </div>
            <h1>
              Um lugar para o que
              <br className="desktop-break" /> você <span>aprende.</span>
            </h1>
            <p>
              Guarde ideias, conecte conceitos e encontre
              <br className="desktop-break" /> aquela referência na hora certa.
            </p>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-code">&lt;/&gt;</div>
            <div className="art-note">
              <div />
              <div />
              <div />
              <span>const knowledge = grow()</span>
            </div>
            <div className="art-star">✦</div>
          </div>
          <div className="hero-metrics">
            <div>
              <strong>{notes.length.toString().padStart(2, "0")}</strong>
              <span>NOTAS NA BIBLIOTECA</span>
            </div>
            <div>
              <strong>{favorites.toString().padStart(2, "0")}</strong>
              <span>IDEIAS FAVORITAS</span>
            </div>
          </div>
        </section>
        <div className="library-toolbar">
          <div className="section-title">
            <h2>
              {favoritesOnly
                ? "Suas favoritas"
                : tag
                  ? `Notas sobre ${tag}`
                  : "Sua biblioteca"}
            </h2>
            <span>{filtered.length} notas</span>
          </div>
          <div className="tools">
            <button
              className="primary-button mobile-create"
              onClick={create}
              disabled={!loaded}
            >
              <Plus size={14} />
              Nova nota
            </button>
            <button
              className="text-button"
              onClick={() => importRef.current?.click()}
              disabled={!loaded}
            >
              <Upload size={14} />
              Importar
            </button>
            <input
              ref={importRef}
              type="file"
              accept="application/json,.json"
              onChange={importBackup}
              hidden
              aria-label="Importar backup JSON"
            />
            <label className="search-box">
              <Search size={16} />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Encontre uma ideia..."
                aria-label="Buscar notas"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Limpar busca"
                >
                  <X size={13} />
                </button>
              ) : (
                <kbd>/</kbd>
              )}
            </label>
          </div>
        </div>
        {notice ? (
          <div className="notice" role="status">
            <Check size={15} />
            <span>{notice}</span>
            <button onClick={() => setNotice("")} aria-label="Fechar aviso">
              <X size={15} />
            </button>
          </div>
        ) : null}
        <div className="mobile-filters">
          <select
            aria-label="Filtrar notas por tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          >
            <option value="">Todas as tags</option>
            {tags.map((t) => (
              <option value={t} key={t}>
                {t}
              </option>
            ))}
          </select>
          <button
            className="secondary-button"
            aria-pressed={favoritesOnly}
            onClick={() => setFavoritesOnly(!favoritesOnly)}
          >
            <Star size={13} />
            Favoritas
          </button>
        </div>
        <section className="notes-workspace">
          <div className="note-list" aria-label="Lista de notas">
            {filtered.map((note) => (
              <article
                key={note.id}
                className={`note-summary ${activeId === note.id && !draft ? "current" : ""}`}
              >
                <div className="note-summary-top">
                  <span className="note-kind">
                    <FileText size={12} />
                    NOTA TÉCNICA
                  </span>
                  <button
                    onClick={() => favorite(note)}
                    className={`favorite-button ${note.favorite ? "favorited" : ""}`}
                    aria-label={`${note.favorite ? "Desfavoritar" : "Favoritar"} ${note.title}`}
                    aria-pressed={note.favorite}
                  >
                    <Star
                      size={15}
                      fill={note.favorite ? "currentColor" : "none"}
                    />
                  </button>
                </div>
                <button className="note-select" onClick={() => select(note.id)}>
                  <h3>{note.title}</h3>
                  <p>
                    {note.content
                      .replace(/[#`>*\[\]]/g, "")
                      .split("\n")
                      .filter(Boolean)
                      .slice(1)
                      .join(" ")
                      .slice(0, 95)}
                    ...
                  </p>
                </button>
                <div className="note-summary-bottom">
                  <div>
                    {note.tags.slice(0, 2).map((t) => (
                      <span
                        className={`tag tag-${t.toLowerCase().replace(/[^a-z]/g, "")}`}
                        key={t}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <time dateTime={note.updatedAt}>
                    {new Intl.DateTimeFormat("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      timeZone: "UTC",
                    }).format(new Date(note.updatedAt))}
                  </time>
                </div>
              </article>
            ))}
            {!filtered.length ? (
              <div className="empty-list">
                <Search size={26} />
                <strong>Nenhuma nota por aqui.</strong>
                <p>Tente outra busca ou guarde uma ideia nova.</p>
                <button
                  className="text-button"
                  onClick={() => {
                    setQuery("");
                    setTag("");
                    setFavoritesOnly(false);
                  }}
                >
                  Limpar filtros
                </button>
              </div>
            ) : null}
          </div>
          <div className="reading-panel">
            {draft ? (
              <NoteEditor
                key={draft.id}
                note={draft}
                onSave={save}
                onCancel={() => {
                  setDraft(null);
                  setActiveId(notes[0]?.id || "");
                }}
              />
            ) : active ? (
              <>
                <div className="reading-toolbar">
                  <span>
                    <span className="reading-dot" />
                    LEITURA
                  </span>
                  <div>
                    <button
                      className="text-button"
                      onClick={() => setDraft(active)}
                    >
                      <Pencil size={14} />
                      Editar nota
                    </button>
                    <button
                      className="icon-button delete-button"
                      onClick={() => remove(active)}
                      aria-label="Excluir nota atual"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <article className="note-content">
                  <div className="reading-tags">
                    {active.tags.map((t) => (
                      <span key={t} className="tag">
                        {t}
                      </span>
                    ))}
                  </div>
                  <h2>{active.title}</h2>
                  <div className="reading-meta">
                    <span>
                      Atualizada em{" "}
                      {new Intl.DateTimeFormat("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        timeZone: "UTC",
                      }).format(new Date(active.updatedAt))}
                    </span>
                    <span>·</span>
                    <span>
                      {Math.max(1, Math.ceil(wordCount(active.content) / 200))}{" "}
                      min de leitura
                    </span>
                  </div>
                  <div className="markdown">
                    <Markdown
                      components={{
                        a: ({ children, href }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {active.content}
                    </Markdown>
                  </div>
                </article>
                <div className="reading-footer">
                  <BookOpen size={14} />
                  <span>O conhecimento cresce quando você volta a ele.</span>
                  <span>{wordCount(active.content)} palavras</span>
                </div>
              </>
            ) : (
              <div className="empty-reader">
                <BookOpen size={40} />
                <h2>Uma nova ideia começa aqui.</h2>
                <p>Crie uma nota ou selecione uma da biblioteca.</p>
                <button className="primary-button" onClick={create}>
                  <Plus size={15} />
                  Criar minha nota
                </button>
              </div>
            )}
          </div>
        </section>
        <footer className="footer">
          <span>Feito para quem nunca para de aprender.</span>
          <span>DEVNOTES / PROJETO DE PORTFÓLIO</span>
        </footer>
      </main>
      {showHelp ? (
        <dialog
          ref={helpRef}
          className="help-modal"
          aria-labelledby="help-title"
          onCancel={() => setShowHelp(false)}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowHelp(false);
          }}
        >
          <section onClick={(e) => e.stopPropagation()}>
            <button
              autoFocus
              className="icon-button"
              onClick={() => setShowHelp(false)}
              aria-label="Fechar ajuda"
            >
              <X size={20} />
            </button>
            <h2 id="help-title">Uma biblioteca que é sua.</h2>
            <p>
              Crie notas em Markdown, organize por tags e marque suas
              referências favoritas. Pressione <kbd>/</kbd> para buscar.
            </p>
            <p>
              Os dados ficam apenas no armazenamento deste navegador. A
              biblioteca não tem sincronização entre dispositivos: use{" "}
              <strong>Exportar</strong> e <strong>Importar</strong> para
              transportar suas notas.
            </p>
            <p>
              A importação combina os arquivos e preserva a versão mais recente
              de cada nota. Os textos iniciais são exemplos de estudo.
            </p>
            <button
              className="primary-button"
              onClick={() => setShowHelp(false)}
            >
              Entendi
              <ArrowLeft size={14} />
            </button>
          </section>
        </dialog>
      ) : null}
    </div>
  );
}
