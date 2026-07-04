import { AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { BookCompleteCelebration } from '../components/ui/BookCompleteCelebration'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { BookCard } from '../features/books/components/BookCard'
import { BookDetailModal } from '../features/books/components/BookDetailModal'
import { BookShelfGrid } from '../features/books/components/BookShelfGrid'
import { CreateBookForm } from '../features/books/components/CreateBookForm'
import { useBooks } from '../features/books/hooks/useBooks'
import type { Book, BookStatus } from '../features/books/types/book.types'

type ShelfFilter = 'all' | BookStatus

const TABS: { status: ShelfFilter; label: string; emoji: string }[] = [
  { status: 'all', label: 'Estante', emoji: '📚' },
  { status: 'lendo', label: 'Lendo', emoji: '📖' },
  { status: 'quero_ler', label: 'Quero Ler', emoji: '🔖' },
  { status: 'lido', label: 'Lido', emoji: '✅' },
]

const SHELF_ORDER: Record<BookStatus, number> = { lendo: 0, quero_ler: 1, lido: 2 }

function sortForShelf(books: Book[]): Book[] {
  return [...books].sort((a, b) => SHELF_ORDER[a.status] - SHELF_ORDER[b.status])
}

export function BooksPage() {
  const [activeStatus, setActiveStatus] = useState<ShelfFilter>('all')
  const [bookToDelete, setBookToDelete] = useState<string | null>(null)
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)
  const {
    books,
    isLoading,
    createBook,
    registerReading,
    changeStatus,
    deleteBook,
    updateCover,
    justCompletedBook,
    clearJustCompleted,
  } = useBooks()

  useEffect(() => {
    if (!justCompletedBook) return
    const timeout = setTimeout(clearJustCompleted, 5500)
    return () => clearTimeout(timeout)
  }, [justCompletedBook, clearJustCompleted])

  const filtered = activeStatus === 'all' ? sortForShelf(books) : books.filter((b) => b.status === activeStatus)
  const counts: Record<ShelfFilter, number> = {
    all: books.length,
    lendo: books.filter((b) => b.status === 'lendo').length,
    quero_ler: books.filter((b) => b.status === 'quero_ler').length,
    lido: books.filter((b) => b.status === 'lido').length,
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

  const bookToDeleteTitle = books.find((b) => b.id === bookToDelete)?.title
  const selectedBook = books.find((b) => b.id === selectedBookId) ?? null

  async function handleRegisterReading(bookId: string, pages: number) {
    await registerReading(bookId, pages)
  }

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
        onChangeStatus={changeStatus}
        onCoverUpdated={updateCover}
        onRequestDelete={handleDelete}
        onClose={() => setSelectedBookId(null)}
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

      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-semibold text-black/80 dark:text-white/80">Biblioteca</h1>
        <span className="text-xs text-black/50 dark:text-white/50">{books.length} livros</span>
      </div>

      <div className="flex gap-1 rounded-xl bg-black/5 p-1 dark:bg-white/10">
        {TABS.map((tab) => (
          <button
            key={tab.status}
            type="button"
            onClick={() => setActiveStatus(tab.status)}
            className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
              activeStatus === tab.status
                ? 'bg-white text-black/80 shadow-sm dark:bg-black/60 dark:text-white/80'
                : 'text-black/50 dark:text-white/50'
            }`}
          >
            <span>{tab.emoji}</span>
            {tab.label}
            {counts[tab.status] > 0 && (
              <span
                className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  activeStatus === tab.status
                    ? 'bg-indigo-500 text-white'
                    : 'bg-black/10 text-black/50 dark:bg-white/10 dark:text-white/50'
                }`}
              >
                {counts[tab.status]}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading && (
        <p className="text-center text-sm text-black/50 dark:text-white/50">Carregando…</p>
      )}

      {activeStatus === 'all' ? (
        <>
          <BookShelfGrid books={filtered} onSelect={setSelectedBookId} />
          {!isLoading && filtered.length === 0 && (
            <p className="text-center text-sm text-black/40 dark:text-white/40">
              Sua estante está vazia. Adicione um livro para começar.
            </p>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onRegisterReading={handleRegisterReading}
                onChangeStatus={changeStatus}
                onDelete={handleDelete}
                onCoverUpdated={updateCover}
              />
            ))}
          </AnimatePresence>

          {!isLoading && filtered.length === 0 && (
            <p className="text-center text-sm text-black/40 dark:text-white/40">
              {activeStatus === 'lendo' && 'Nenhum livro sendo lido.'}
              {activeStatus === 'quero_ler' && 'Nenhum livro na lista de desejo.'}
              {activeStatus === 'lido' && 'Nenhum livro finalizado ainda.'}
            </p>
          )}
        </div>
      )}

      <CreateBookForm onCreate={createBook} />
    </div>
  )
}
