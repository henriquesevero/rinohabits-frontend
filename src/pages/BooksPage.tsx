import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AnimatePresence } from 'framer-motion'
import { BookCheck, BookOpen, Bookmark, GripVertical, Library, PackageOpen, type LucideIcon } from 'lucide-react'
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

const TABS: { status: ShelfFilter; label: string; icon: LucideIcon }[] = [
  { status: 'all',        label: 'Estante',    icon: Library     },
  { status: 'na_estante', label: 'Na Estante', icon: PackageOpen },
  { status: 'quero_ler',  label: 'Quero Ler',  icon: Bookmark    },
  { status: 'lendo',      label: 'Lendo',      icon: BookOpen    },
  { status: 'lido',       label: 'Lido',       icon: BookCheck   },
]

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
    reorderBooks,
    justCompletedBook,
    clearJustCompleted,
  } = useBooks()

  useEffect(() => {
    if (!justCompletedBook) return
    const timeout = setTimeout(clearJustCompleted, 5500)
    return () => clearTimeout(timeout)
  }, [justCompletedBook, clearJustCompleted])

  const filtered = activeStatus === 'all' ? books : books.filter((b) => b.status === activeStatus)
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

  const bookToDeleteTitle = books.find((b) => b.id === bookToDelete)?.title
  const selectedBook = books.find((b) => b.id === selectedBookId) ?? null

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
    await changeStatus(bookId, status)
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
        onChangeStatus={handleChangeStatus}
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

      {activeStatus === 'all' && <CreateBookForm onCreate={createBook} />}

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

      {isLoading && (
        <p className="text-center text-sm text-black/50 dark:text-white/50">Carregando…</p>
      )}

      {activeStatus === 'all' ? (
        <>
          <BookShelfGrid books={filtered} onSelect={setSelectedBookId} onReorder={reorderBooks} />
          {!isLoading && filtered.length === 0 && (
            <p className="text-center text-sm text-black/40 dark:text-white/40">
              Sua estante está vazia. Adicione um livro para começar.
            </p>
          )}
        </>
      ) : (
        <SortableBookList
          books={filtered}
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
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 5 } }),
  )

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    const oldIndex = books.findIndex((b) => b.id === active.id)
    const newIndex = books.findIndex((b) => b.id === over.id)
    onReorder(arrayMove(books, oldIndex, newIndex).map((b) => b.id))
  }

  return (
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
              {activeStatus === 'na_estante' && 'Nenhum livro só na estante.'}
              {activeStatus === 'quero_ler'  && 'Nenhum livro na lista de desejo.'}
              {activeStatus === 'lendo'      && 'Nenhum livro sendo lido.'}
              {activeStatus === 'lido'       && 'Nenhum livro finalizado ainda.'}
            </p>
          )}
        </div>
      </SortableContext>
    </DndContext>
  )
}

interface SortableBookCardRowProps {
  book: Book
  onRegisterReading: (bookId: string, pages: number) => Promise<void>
  onChangeStatus: (bookId: string, status: BookStatus) => Promise<void>
  onDelete: (bookId: string) => void
  onCoverUpdated: (bookId: string, url: string) => void
}

function SortableBookCardRow({
  book,
  onRegisterReading,
  onChangeStatus,
  onDelete,
  onCoverUpdated,
}: SortableBookCardRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: book.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-stretch gap-1">
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
