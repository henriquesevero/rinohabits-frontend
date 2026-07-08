import {
  DndContext,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpDown, BookCheck, BookOpen, BookPlus, Bookmark, GripVertical, Library, Search, X, type LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { BookCompleteCelebration } from '../components/ui/BookCompleteCelebration'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { BookCard } from '../features/books/components/BookCard'
import { BookDetailModal } from '../features/books/components/BookDetailModal'
import { BookReorderPanel } from '../features/books/components/BookReorderPanel'
import { BookShelfGrid } from '../features/books/components/BookShelfGrid'
import { CreateBookForm } from '../features/books/components/CreateBookForm'
import { useBooks } from '../features/books/hooks/useBooks'
import type { Book, BookStatus } from '../features/books/types/book.types'

type ShelfFilter = 'all' | BookStatus

const TABS: { status: ShelfFilter; label: string; icon: LucideIcon }[] = [
  { status: 'all',       label: 'Estante',   icon: Library   },
  { status: 'quero_ler', label: 'Quero Ler', icon: Bookmark  },
  { status: 'lendo',     label: 'Lendo',     icon: BookOpen  },
  { status: 'lido',      label: 'Lido',      icon: BookCheck },
]

export function BooksPage() {
  const [activeStatus, setActiveStatus] = useState<ShelfFilter>('all')
  const [filterQuery, setFilterQuery] = useState('')
  const [isAddingBook, setIsAddingBook] = useState(false)
  const [isReordering, setIsReordering] = useState(false)
  const [bookToDelete, setBookToDelete] = useState<string | null>(null)
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  const [pageResetBook, setPageResetBook] = useState<Book | null>(null)
  const [pageInput, setPageInput] = useState('')
  const {
    books,
    isLoading,
    createBook,
    registerReading,
    changeStatus,
    updateBook,
    deleteBook,
    updateCover,
    reorderBooks,
    justCompletedBook,
    clearJustCompleted,
  } = useBooks()

  // Exit reorder/add mode and clear filter when tab changes
  useEffect(() => {
    if (activeStatus !== 'all') setIsReordering(false)
    setIsAddingBook(false)
    setFilterQuery('')
  }, [activeStatus])

  useEffect(() => {
    if (!justCompletedBook) return
    const timeout = setTimeout(clearJustCompleted, 5500)
    return () => clearTimeout(timeout)
  }, [justCompletedBook, clearJustCompleted])

  const filtered = activeStatus === 'all'
    ? books
    : books.filter((b) => b.status === activeStatus)

  const q = filterQuery.trim().toLowerCase()
  const displayBooks = q
    ? filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          (b.author ?? '').toLowerCase().includes(q) ||
          (b.collection ?? '').toLowerCase().includes(q),
      )
    : filtered

  const counts: Record<ShelfFilter, number> = {
    all:        books.length,
    na_estante: books.filter((b) => b.status === 'na_estante').length,
    quero_ler:  books.filter((b) => b.status === 'quero_ler').length,
    lendo:      books.filter((b) => b.status === 'lendo').length,
    lido:       books.filter((b) => b.status === 'lido').length,
  }

  function handleDelete(bookId: string) {
    setBookToDelete(bookId)
  }

  async function handleDeleteConfirm() {
    if (bookToDelete) {
      await deleteBook(bookToDelete)
      setBookToDelete(null)
      setSelectedBookId(null)
    }
  }

  async function handleRegisterReading(bookId: string, pages: number) {
    await registerReading(bookId, pages)
  }

  async function handleChangeStatus(bookId: string, status: BookStatus) {
    if (status === 'lido') {
      const book = books.find((b) => b.id === bookId)
      if (book?.totalPages && book.currentPage < book.totalPages) {
        await registerReading(bookId, book.totalPages - book.currentPage)
      }
    }
    if (status === 'lendo') {
      const book = books.find((b) => b.id === bookId)
      if (book?.totalPages && book.currentPage >= book.totalPages) {
        setPageInput('')
        setPageResetBook(book)
        return
      }
    }
    await changeStatus(bookId, status)
  }

  async function handlePageResetConfirm() {
    if (!pageResetBook) return
    const page = parseInt(pageInput, 10)
    const validPage = !isNaN(page) && page >= 0 ? page : 0
    await changeStatus(pageResetBook.id, 'lendo', validPage)
    setPageResetBook(null)
    setPageInput('')
  }

  async function handleReorderConfirm(orderedIds: string[]) {
    await reorderBooks(orderedIds)
    setIsReordering(false)
  }

  const bookToDeleteTitle = books.find((b) => b.id === bookToDelete)?.title
  const selectedBook = books.find((b) => b.id === selectedBookId) ?? null
  const existingCollections = [...new Set(books.map((b) => b.collection).filter(Boolean) as string[])]

  return (
    <div className="flex flex-col gap-4">
      <BookCompleteCelebration
        show={justCompletedBook !== null}
        bookTitle={justCompletedBook?.title ?? null}
        onDismiss={clearJustCompleted}
      />

      <BookDetailModal
        book={selectedBook}
        onRegisterReading={handleRegisterReading}
        onChangeStatus={handleChangeStatus}
        onUpdateBook={updateBook}
        onCoverUpdated={updateCover}
        onRequestDelete={handleDelete}
        onClose={() => setSelectedBookId(null)}
        existingCollections={existingCollections}
      />

      <ConfirmModal
        isOpen={bookToDelete !== null}
        title="Excluir livro"
        description={`Tem certeza que deseja excluir "${bookToDeleteTitle ?? 'este livro'}"? Todo o histórico de leitura será perdido permanentemente.`}
        confirmLabel="Excluir"
        destructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => setBookToDelete(null)}
      />

      <AnimatePresence>
        {pageResetBook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            onClick={() => setPageResetBook(null)}
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-2xl border border-white/20 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:bg-black/80"
            >
              <p className="text-base font-semibold text-black/90 dark:text-white/90">Em qual página você parou?</p>
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                {pageResetBook.title}
                {pageResetBook.totalPages ? ` · ${pageResetBook.totalPages} páginas` : ''}
              </p>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={pageResetBook.totalPages ?? undefined}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                placeholder="Número da página"
                autoFocus
                className="mt-4 w-full rounded-xl border border-black/10 bg-white/60 px-4 py-2.5 text-sm text-black/90 placeholder:text-black/30 focus:border-black/30 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white/90 dark:placeholder:text-white/30"
              />
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPageResetBook(null)}
                  className="flex-1 rounded-xl border border-black/10 py-2.5 text-sm font-medium text-black/70 hover:bg-black/5 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handlePageResetConfirm}
                  className="flex-1 rounded-xl bg-black/80 py-2.5 text-sm font-semibold text-white hover:bg-black dark:bg-white/90 dark:text-black/90"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-semibold text-black/80 dark:text-white/80">Biblioteca</h1>
        <span className="text-xs text-black/50 dark:text-white/50">{books.length} livros</span>
      </div>

      {/* ── Tab bar — hidden while reordering ── */}
      {!isReordering && (
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-black/5 p-1 dark:bg-white/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => (
            <button
              key={tab.status}
              type="button"
              onClick={() => setActiveStatus(tab.status)}
              className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activeStatus === tab.status
                  ? 'bg-white text-black/80 shadow-sm dark:bg-black/60 dark:text-white/80'
                  : 'text-black/50 dark:text-white/50'
              }`}
            >
              <tab.icon className="h-3.5 w-3.5 shrink-0" strokeWidth={activeStatus === tab.status ? 2.5 : 1.8} />
              {tab.label}
              {counts[tab.status] > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    activeStatus === tab.status
                      ? 'bg-[#007a4c] text-white dark:bg-[#00E08A] dark:text-black'
                      : 'bg-black/10 text-black/50 dark:bg-white/10 dark:text-white/50'
                  }`}
                >
                  {counts[tab.status]}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Search filter — always visible when there are books ── */}
      {!isReordering && books.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/30 dark:text-white/30" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filtrar por título, autor ou coleção…"
            className="w-full rounded-xl border border-black/10 bg-white/50 py-2 pl-8 pr-8 text-sm text-black/80 placeholder:text-black/30 focus:border-black/20 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:placeholder:text-white/30"
          />
          {filterQuery && (
            <button
              type="button"
              onClick={() => setFilterQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-black/30 hover:text-black/60 dark:text-white/30 dark:hover:text-white/60"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* ── Action buttons — only on Estante tab ── */}
      {activeStatus === 'all' && !isReordering && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsAddingBook((v) => !v)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-medium transition-colors ${
              isAddingBook
                ? 'border-black/20 bg-black/80 text-white dark:border-white/20 dark:bg-white/90 dark:text-black/90'
                : 'border-black/15 bg-white/40 text-black/60 hover:bg-black/5 dark:border-white/15 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10'
            }`}
          >
            <BookPlus className="h-4 w-4" />
            Adicionar livro
          </button>

          {books.length > 1 && (
            <button
              type="button"
              onClick={() => { setIsAddingBook(false); setIsReordering(true) }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-black/15 bg-white/40 py-2.5 text-xs font-medium text-black/60 transition-colors hover:bg-black/5 dark:border-white/15 dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10"
            >
              <ArrowUpDown className="h-4 w-4" />
              Reordenar
            </button>
          )}
        </div>
      )}

      {/* ── Add book form — inline, below action buttons ── */}
      {activeStatus === 'all' && !isReordering && (
        <CreateBookForm
          onCreate={createBook}
          open={isAddingBook}
          onClose={() => setIsAddingBook(false)}
          existingCollections={existingCollections}
        />
      )}

      {isLoading && (
        <p className="text-center text-sm text-black/50 dark:text-white/50">Carregando…</p>
      )}

      {/* ── Estante (all) ── */}
      {activeStatus === 'all' && !isReordering && (
        <>
          <BookShelfGrid books={displayBooks} onSelect={setSelectedBookId} />
          {!isLoading && displayBooks.length === 0 && (
            <p className="text-center text-sm text-black/40 dark:text-white/40">
              {q ? 'Nenhum livro encontrado.' : 'Sua estante está vazia. Adicione um livro para começar.'}
            </p>
          )}
        </>
      )}

      {/* ── Reorder panel ── */}
      {activeStatus === 'all' && isReordering && (
        <BookReorderPanel
          books={books}
          onConfirm={handleReorderConfirm}
          onCancel={() => setIsReordering(false)}
        />
      )}

      {/* ── Status tabs list ── */}
      {activeStatus !== 'all' && (
        <SortableBookList
          books={displayBooks}
          onRegisterReading={handleRegisterReading}
          onChangeStatus={handleChangeStatus}
          onDelete={handleDelete}
          onCoverUpdated={updateCover}
          onReorder={reorderBooks}
          isLoading={isLoading}
          activeStatus={activeStatus}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Sortable list used by the individual status tabs
// ─────────────────────────────────────────────

interface SortableBookListProps {
  books: Book[]
  onRegisterReading: (bookId: string, pages: number) => Promise<void>
  onChangeStatus: (bookId: string, status: BookStatus) => Promise<void>
  onDelete: (bookId: string) => void
  onCoverUpdated: (bookId: string, url: string) => void
  onReorder: (reorderedIds: string[]) => void
  isLoading: boolean
  activeStatus: ShelfFilter
}

function SortableBookList({
  books,
  onRegisterReading,
  onChangeStatus,
  onDelete,
  onCoverUpdated,
  onReorder,
  isLoading,
  activeStatus,
}: SortableBookListProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
  )

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    const oldIndex = books.findIndex((b) => b.id === active.id)
    const newIndex = books.findIndex((b) => b.id === over.id)
    onReorder(arrayMove(books, oldIndex, newIndex).map((b) => b.id))
  }

  return (
    <div data-no-swipe>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={books.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {books.map((book) => (
                <SortableBookCardRow
                  key={book.id}
                  book={book}
                  onRegisterReading={onRegisterReading}
                  onChangeStatus={onChangeStatus}
                  onDelete={onDelete}
                  onCoverUpdated={onCoverUpdated}
                />
              ))}
            </AnimatePresence>

            {!isLoading && books.length === 0 && (
              <p className="text-center text-sm text-black/40 dark:text-white/40">
                {activeStatus === 'quero_ler' && 'Nenhum livro na lista de desejo.'}
                {activeStatus === 'lendo'     && 'Nenhum livro sendo lido.'}
                {activeStatus === 'lido'      && 'Nenhum livro finalizado ainda.'}
              </p>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

function SortableBookCardRow({
  book,
  onRegisterReading,
  onChangeStatus,
  onDelete,
  onCoverUpdated,
}: {
  book: Book
  onRegisterReading: (bookId: string, pages: number) => Promise<void>
  onChangeStatus: (bookId: string, status: BookStatus) => Promise<void>
  onDelete: (bookId: string) => void
  onCoverUpdated: (bookId: string, url: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: book.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition: transition ?? undefined,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="flex items-stretch gap-1"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex touch-none cursor-grab items-center px-1 active:cursor-grabbing"
        aria-label="Arraste para reordenar"
      >
        <GripVertical className="h-4 w-4 text-black/20 dark:text-white/20" />
      </button>
      <div className="min-w-0 flex-1">
        <BookCard
          book={book}
          onRegisterReading={onRegisterReading}
          onChangeStatus={onChangeStatus}
          onDelete={onDelete}
          onCoverUpdated={onCoverUpdated}
        />
      </div>
    </div>
  )
}
