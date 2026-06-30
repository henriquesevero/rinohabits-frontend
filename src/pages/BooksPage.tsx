import { AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { BookCompleteCelebration } from '../components/ui/BookCompleteCelebration'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { BookCard } from '../features/books/components/BookCard'
import { CreateBookForm } from '../features/books/components/CreateBookForm'
import { useBooks } from '../features/books/hooks/useBooks'
import type { BookStatus } from '../features/books/types/book.types'

const TABS: { status: BookStatus; label: string; emoji: string }[] = [
  { status: 'lendo', label: 'Lendo', emoji: '📖' },
  { status: 'quero_ler', label: 'Quero Ler', emoji: '🔖' },
  { status: 'lido', label: 'Lido', emoji: '✅' },
]

export function BooksPage() {
  const [activeStatus, setActiveStatus] = useState<BookStatus>('lendo')
  const [bookToDelete, setBookToDelete] = useState<string | null>(null)
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

  const filtered = books.filter((b) => b.status === activeStatus)
  const counts: Record<BookStatus, number> = {
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
    }
  }

  const bookToDeleteTitle = books.find((b) => b.id === bookToDelete)?.title

  async function handleRegisterReading(bookId: string, pages: number) {
    await registerReading(bookId, pages)
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <BookCompleteCelebration
        show={justCompletedBook !== null}
        bookTitle={justCompletedBook?.title ?? null}
        onDismiss={clearJustCompleted}
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

      <CreateBookForm onCreate={createBook} />
    </div>
  )
}
