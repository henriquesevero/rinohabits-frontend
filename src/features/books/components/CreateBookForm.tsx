import { Loader2, Plus, Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { bookService } from '../services/bookService'
import type { BookStatus, CreateBookPayload, GoogleBook } from '../types/book.types'

const STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: 'quero_ler', label: 'Quero Ler' },
  { value: 'lendo', label: 'Lendo' },
  { value: 'lido', label: 'Lido' },
]

interface CreateBookFormProps {
  onCreate: (payload: CreateBookPayload) => Promise<void>
}

type Step = 'search' | 'confirm'

export function CreateBookForm({ onCreate }: CreateBookFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<Step>('search')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GoogleBook[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [totalPages, setTotalPages] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [status, setStatus] = useState<BookStatus>('quero_ler')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function reset() {
    setStep('search')
    setQuery('')
    setResults([])
    setHasSearched(false)
    setTitle('')
    setAuthor('')
    setTotalPages('')
    setCoverUrl('')
    setStatus('quero_ler')
  }

  async function handleSearch(e?: FormEvent) {
    e?.preventDefault()
    if (!query.trim()) return
    setIsSearching(true)
    setHasSearched(true)
    try {
      const data = await bookService.searchGoogle(query.trim())
      setResults(data)
    } catch {
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  function selectBook(book: GoogleBook) {
    setTitle(book.title)
    setAuthor(book.author)
    setTotalPages(book.page_count > 0 ? String(book.page_count) : '')
    setCoverUrl(book.cover_url)
    setStep('confirm')
  }

  function enterManual() {
    setTitle('')
    setAuthor('')
    setTotalPages('')
    setCoverUrl('')
    setStep('confirm')
  }

  async function handleConfirm(e: FormEvent) {
    e.preventDefault()
    if (!title) return
    const pages = Number.parseInt(totalPages, 10)
    setIsSubmitting(true)
    try {
      await onCreate({
        title,
        author,
        totalPages: Number.isFinite(pages) && pages > 0 ? pages : null,
        status,
        coverUrl: coverUrl || null,
      })
      reset()
      setIsOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/30 px-4 py-3 text-sm text-black/50 hover:bg-white/20 dark:text-white/50"
      >
        <Plus className="h-4 w-4" />
        Adicionar livro
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/20 bg-white/40 p-4 backdrop-blur-md dark:bg-black/30">
      {step === 'search' ? (
        <>
          <p className="text-sm font-semibold text-black/80 dark:text-white/80">Buscar livro</p>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Título ou autor..."
              className="flex-1 rounded-lg border border-white/30 bg-white/40 px-3 py-2 text-sm text-black/80 outline-none placeholder:text-black/40 dark:bg-black/30 dark:text-white/80"
            />
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="flex shrink-0 items-center justify-center rounded-lg bg-black/80 px-3 py-2 text-white disabled:opacity-50 dark:bg-white/90 dark:text-black/80"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </button>
          </form>

          {hasSearched && !isSearching && results.length === 0 && (
            <p className="text-center text-xs text-black/40 dark:text-white/40">
              Nenhum resultado encontrado.
            </p>
          )}

          {results.length > 0 && (
            <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
              {results.map((book) => (
                <button
                  key={book.google_id}
                  type="button"
                  onClick={() => selectBook(book)}
                  className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/30 p-2 text-left transition-colors hover:bg-white/50 dark:bg-black/20 dark:hover:bg-black/40"
                >
                  {book.cover_url ? (
                    <img
                      src={book.cover_url}
                      alt=""
                      className="h-14 w-10 shrink-0 rounded object-cover shadow-sm"
                    />
                  ) : (
                    <div className="h-14 w-10 shrink-0 rounded bg-black/10 dark:bg-white/10" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-black/80 dark:text-white/80">
                      {book.title}
                    </p>
                    {book.author && (
                      <p className="truncate text-xs text-black/50 dark:text-white/50">
                        {book.author}
                      </p>
                    )}
                    {book.page_count > 0 && (
                      <p className="text-xs text-black/35 dark:text-white/35">
                        {book.page_count} páginas
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={enterManual}
              className="text-xs text-black/40 transition-colors hover:text-black/60 dark:text-white/40 dark:hover:text-white/60"
            >
              Adicionar manualmente →
            </button>
            <button
              type="button"
              onClick={() => { reset(); setIsOpen(false) }}
              className="text-xs text-black/40 transition-colors hover:text-black/60 dark:text-white/40 dark:hover:text-white/60"
            >
              Cancelar
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleConfirm} className="flex flex-col gap-3">
          {coverUrl && (
            <div className="flex justify-center">
              <img
                src={coverUrl}
                alt=""
                className="h-32 w-[86px] rounded-lg object-cover shadow-md"
              />
            </div>
          )}

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do livro*"
            required
            className="rounded-lg border border-white/30 bg-white/40 px-3 py-2 text-sm text-black/80 outline-none placeholder:text-black/40 dark:bg-black/30 dark:text-white/80"
          />
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Autor"
            className="rounded-lg border border-white/30 bg-white/40 px-3 py-2 text-sm text-black/80 outline-none placeholder:text-black/40 dark:bg-black/30 dark:text-white/80"
          />
          <input
            type="number"
            min={1}
            value={totalPages}
            onChange={(e) => setTotalPages(e.target.value)}
            placeholder="Total de páginas"
            className="rounded-lg border border-white/30 bg-white/40 px-3 py-2 text-sm text-black/80 outline-none placeholder:text-black/40 dark:bg-black/30 dark:text-white/80"
          />

          <div className="flex gap-1 rounded-lg bg-black/5 p-1 dark:bg-white/10">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  status === opt.value
                    ? 'bg-white text-black/80 shadow-sm dark:bg-black/60 dark:text-white/80'
                    : 'text-black/50 dark:text-white/50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep('search')}
              className="flex-1 rounded-lg border border-white/30 px-3 py-2 text-xs text-black/60 dark:text-white/60"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title}
              className="flex-1 rounded-lg bg-black/80 px-3 py-2 text-xs font-medium text-white disabled:opacity-50 dark:bg-white/90 dark:text-black/80"
            >
              {isSubmitting ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
