import axios from 'axios'
import { Loader2, Plus, Search } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { bookService } from '../services/bookService'
import type { CreateBookPayload, GoogleBook } from '../types/book.types'

// Module-level cache: persists across remounts, shared between form instances
const CACHE_TTL_MS = 5 * 60 * 1000
const searchCache = new Map<string, { data: GoogleBook[]; expiresAt: number }>()

function getCached(q: string): GoogleBook[] | null {
  const entry = searchCache.get(q)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) { searchCache.delete(q); return null }
  return entry.data
}

function setCached(q: string, data: GoogleBook[]) {
  searchCache.set(q, { data, expiresAt: Date.now() + CACHE_TTL_MS })
}

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
  const [searchError, setSearchError] = useState(false)

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [totalPages, setTotalPages] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const seqRef = useRef(0) // sequence counter — discard stale responses

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const q = query.trim()

    if (q.length < 2) {
      abortRef.current?.abort()
      setResults([])
      setHasSearched(false)
      setSearchError(false)
      setIsSearching(false)
      return
    }

    // Instant cache hit — no debounce, no spinner
    const cached = getCached(q)
    if (cached) {
      abortRef.current?.abort()
      setResults(cached)
      setHasSearched(true)
      setSearchError(false)
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    debounceRef.current = setTimeout(() => runSearch(q), 450)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query]) // eslint-disable-line react-hooks/exhaustive-deps

  async function runSearch(q: string) {
    // Cancel any in-flight request
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    // Increment sequence — any response with a lower seq is stale
    const seq = ++seqRef.current

    setHasSearched(true)
    setSearchError(false)

    try {
      let data: GoogleBook[]
      try {
        data = await bookService.searchGoogle(q, ctrl.signal)
      } catch (firstErr) {
        if (axios.isCancel(firstErr)) return
        if (seq !== seqRef.current) return
        // Retry once — backend may be cold-starting
        await new Promise((r) => setTimeout(r, 700))
        if (seq !== seqRef.current) return
        data = await bookService.searchGoogle(q, ctrl.signal)
      }

      if (seq !== seqRef.current) return

      setCached(q, data)
      setResults(data)
    } catch (err) {
      if (seq !== seqRef.current) return
      if (axios.isCancel(err)) return

      setResults([])
      setSearchError(true)
    } finally {
      if (seq === seqRef.current) setIsSearching(false)
    }
  }

  function reset() {
    abortRef.current?.abort()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setStep('search')
    setQuery('')
    setResults([])
    setHasSearched(false)
    setSearchError(false)
    setIsSearching(false)
    setTitle('')
    setAuthor('')
    setTotalPages('')
    setCoverUrl('')
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
        status: 'na_estante',
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

          <div className="flex items-center gap-2 rounded-lg border border-black/15 bg-white/40 px-3 py-2 dark:border-white/20 dark:bg-black/30">
            {isSearching ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-black/35 dark:text-white/35" />
            ) : (
              <Search className="h-4 w-4 shrink-0 text-black/35 dark:text-white/35" />
            )}
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite o título ou autor..."
              autoFocus
              className="flex-1 bg-transparent text-sm text-black/80 outline-none placeholder:text-black/40 dark:text-white/80 dark:placeholder:text-white/40"
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="shrink-0 text-xs text-black/30 hover:text-black/60 dark:text-white/30 dark:hover:text-white/60"
              >
                ✕
              </button>
            )}
          </div>

          {query.trim().length > 0 && query.trim().length < 2 && (
            <p className="text-center text-xs text-black/35 dark:text-white/35">
              Continue digitando...
            </p>
          )}

          {hasSearched && !isSearching && searchError && (
            <p className="text-center text-xs text-red-500 dark:text-red-400">
              Erro ao buscar. Verifique sua conexão.
            </p>
          )}

          {hasSearched && !isSearching && !searchError && results.length === 0 && (
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
            className="rounded-lg border border-black/15 bg-white/40 px-3 py-2 text-sm text-black/80 outline-none placeholder:text-black/40 dark:border-white/20 dark:bg-black/30 dark:text-white/80 dark:placeholder:text-white/40"
          />
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Autor"
            className="rounded-lg border border-black/15 bg-white/40 px-3 py-2 text-sm text-black/80 outline-none placeholder:text-black/40 dark:border-white/20 dark:bg-black/30 dark:text-white/80 dark:placeholder:text-white/40"
          />
          <input
            type="number"
            min={1}
            value={totalPages}
            onChange={(e) => setTotalPages(e.target.value)}
            placeholder="Total de páginas"
            className="rounded-lg border border-black/15 bg-white/40 px-3 py-2 text-sm text-black/80 outline-none placeholder:text-black/40 dark:border-white/20 dark:bg-black/30 dark:text-white/80 dark:placeholder:text-white/40"
          />

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
