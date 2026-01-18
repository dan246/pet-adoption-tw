import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className = ''
}) {
  if (totalPages <= 1) return null

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = []
    const leftSibling = Math.max(currentPage - siblingCount, 1)
    const rightSibling = Math.min(currentPage + siblingCount, totalPages)

    // Always show first page
    if (leftSibling > 1) {
      pages.push(1)
      if (leftSibling > 2) pages.push('...')
    }

    // Show pages around current
    for (let i = leftSibling; i <= rightSibling; i++) {
      pages.push(i)
    }

    // Always show last page
    if (rightSibling < totalPages) {
      if (rightSibling < totalPages - 1) pages.push('...')
      pages.push(totalPages)
    }

    return pages
  }

  const pages = getPageNumbers()

  return (
    <div className={`flex items-center justify-center gap-1 sm:gap-2 ${className}`}>
      {/* First Page */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="hidden sm:flex w-9 h-9 items-center justify-center rounded-lg text-text-secondary hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        aria-label="第一頁"
      >
        <ChevronsLeft className="w-4 h-4" />
      </button>

      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex w-9 h-9 items-center justify-center rounded-lg text-text-secondary hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        aria-label="上一頁"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="w-9 h-9 flex items-center justify-center text-text-light">
              ⋯
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-9 h-9 rounded-lg font-medium transition-all ${
                currentPage === page
                  ? 'bg-primary text-white shadow-glow'
                  : 'text-text-secondary hover:bg-primary/10 hover:text-primary'
              }`}
            >
              {page}
            </button>
          )
        ))}
      </div>

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex w-9 h-9 items-center justify-center rounded-lg text-text-secondary hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        aria-label="下一頁"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Last Page */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="hidden sm:flex w-9 h-9 items-center justify-center rounded-lg text-text-secondary hover:bg-primary/10 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        aria-label="最後一頁"
      >
        <ChevronsRight className="w-4 h-4" />
      </button>
    </div>
  )
}
