import axios from 'axios'
import { Loader2, Plus, Search } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { bookService } from '../services/bookService'
import type { BookSearchResult, CreateBookPayload } from '../types/book.types'

type SearchType = 'general' | 'title' | 'author'
type SearchSource = 'openlib' | 'google'

const CACHE_TTL_MS = 5 * 60 * 1000
const searchCache = new Map<string, { data: BookSearchResult[]; expiresAt: number }>()

function cacheKey(q: string, type: SearchType, source: SearchSource) {
  return `${source}:${type}:${q}`
}

function getCached(q: string, type: SearchType, source: SearchSource): BookSearchResult[] | null {
  const entry = searchCache.get(cacheKey(q, type, source))
  if (!entry) return null
  if (Date.now() > entry.expiresAt) { searchCache.delete(cacheKey(q, type, source)); return null }
  return entry.data
}

function setCached(q: string, type: SearchType, source: SearchSource, data: BookSearchResult[]) {
  searchCache.set(cacheKey(q, type, source), { data, expiresAt: Date.now() + CACHE_TTL_MS })
}

interface CreateBookFormProps {
  onCreate: (payload: CreateBookPayload) => Promise<void>
}

type Step = 'search' | 'confirm'

const SEARCH_TYPES: { value: SearchType; label: string }[] = [
  { value: 'general', label: 'Geral' },
  { value: 'title',   label: 'Título' },
  { value: 'author',  label: 'Autor' },
]

export function CreateBookForm({ onCreate }: CreateBookFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<Step>('search')
  const [searchType, setSearchType] = useState<SearchType>('general')
  const [searchSource, setSearchSource] = useState<SearchSource>('openlib')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<BookSearchResult[]>([])
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
  const seqRef = useRef(0)

  // Re-fire search when source or type changes (if there's already a query)
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

    const cached = getCached(q, searchType, searchSource)
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
  }, [query, searchType, searchSource]) // eslint-disable-line react-hooks/exhaustive-deps

  async function runSearch(q: string) {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    const seq = ++seqRef.current

    setHasSearched(true)
    setSearchError(false)

    try {
      let data: BookSearchResult[]
      try {
        data = await bookService.search(q, searchType, searchSource, ctrl.signal)
      } catch (firstErr) {
        if (axios.isCancel(firstErr)) return
        if (seq !== seqRef.current) return
        await new Promise((r) => setTimeout(r, 700))
        if (seq !== seqRef.current) return
        data = await bookService.search(q, searchType, searchSource, ctrl.signal)
      }

      if (seq !== seqRef.current) return
      setCached(q, searchType, searchSource, data)
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
    setSearchSource('openlib')
    setTitle('')
    setAuthor('')
    setTotalPages('')
    setCoverUrl('')
  }

  function switchToGoogle() {
    setResults([])
    setHasSearched(false)
    setSearchSource('google')
    // Immediately fire search with current query (effect handles it via dependency on searchSource)
  }

  function switchToOpenLib() {
    setResults([])
    setHasSearched(false)
    setSearchSource('openlib')
  }

  function selectBook(book: BookSearchResult) {
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

  const noResults = hasSearched && !isSearching && !searchError && results.length === 0

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
          {/* Header row */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-black/80 dark:text-white/80">Buscar livro</p>
            <div className="flex gap-0.5 rounded-lg bg-black/5 p-0.5 dark:bg-white/10">
              <button
                type="button"
                onClick={switchToOpenLib}
                className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${
                  searchSource === 'openlib'
                    ? 'bg-white text-black/80 shadow-sm dark:bg-black/60 dark:text-white/80'
                    : 'text-black/50 dark:text-white/50'
                }`}
              >
                Open Library
              </button>
              <button
                type="button"
                onClick={switchToGoogle}
                className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors ${
                  searchSource === 'google'
                    ? 'bg-white text-black/80 shadow-sm dark:bg-black/60 dark:text-white/80'
                    : 'text-black/50 dark:text-white/50'
                }`}
              >
                Google Books
              </button>
            </div>
          </div>

          {/* Search type toggle */}
          <div className="flex gap-1 rounded-lg bg-black/5 p-0.5 dark:bg-white/10">
            {SEARCH_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => { setSearchType(t.value); setResults([]); setHasSearched(false) }}
                className={`flex-1 rounded-md py-1 text-xs font-medium transition-colors ${
                  searchType === t.value
                    ? 'bg-white text-black/80 shadow-sm dark:bg-black/60 dark:text-white/80'
                    : 'text-black/50 dark:text-white/50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="flex items-center gap-2 rounded-lg border border-black/15 bg-white/40 px-3 py-2 dark:border-white/20 dark:bg-black/30">
            {isSearching ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-black/35 dark:text-white/35" />
            ) : (
              <Search className="h-4 w-4 shrink-0 text-black/35 dark:text-white/35" />
            )}
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                searchType === 'author' ? 'Nome do autor...' :
                searchType === 'title'  ? 'Título do livro...' :
                'Título ou autor...'
              }
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
            <p className="text-center text-xs text-black/35 dark:text-white/35">Continue digitando...</p>
          )}

          {hasSearched && !isSearching && searchError && (
            <p className="text-center text-xs text-red-500 dark:text-red-400">
              Erro ao buscar. Verifique sua conexão.
            </p>
          )}

          {/* No results */}
          {noResults && (
            <p className="text-center text-xs text-black/40 dark:text-white/40">
              {searchSource === 'openlib'
                ? 'Nenhum resultado no Open Library. Tente o Google Books.'
                : 'Nenhum resultado encontrado.'}
            </p>
          )}

          {/* Results list */}
          {results.length > 0 && (
            <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
              {results.map((book) => (
                <button
                  key={book.id}
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
                      <p className="truncate text-xs text-black/50 dark:text-white/50">{book.author}</p>
                    )}
                    {book.page_count > 0 && (
                      <p className="text-xs text-black/35 dark:text-white/35">{book.page_count} páginas</p>
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
              <img src={coverUrl} alt="" className="h-32 w-[86px] rounded-lg object-cover shadow-md" />
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
