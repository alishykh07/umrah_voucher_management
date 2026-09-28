import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

export const getPaginationPages = (page, totalPages, maxVisible = 5) => {
  const safeTotal = Math.max(1, Number(totalPages) || 1);
  const safePage = Math.min(Math.max(1, Number(page) || 1), safeTotal);
  const count = Math.min(safeTotal, maxVisible);
  const start = Math.max(1, Math.min(safeTotal - count + 1, safePage - Math.floor(count / 2)));
  return Array.from({ length: count }, (_, index) => start + index);
};

export default function Pagination({ page = 1, totalPages = 1, onChange, className = '' }) {
  const safeTotal = Math.max(1, Number(totalPages) || 1);
  const safePage = Math.min(Math.max(1, Number(page) || 1), safeTotal);
  const goTo = (nextPage) => {
    const target = Math.min(Math.max(1, nextPage), safeTotal);
    if (target !== safePage) onChange?.(target);
  };

  return <div className={`shared-pagination ${className}`} aria-label="Pagination">
    <button type="button" className="pagination-arrow" aria-label="Previous page" disabled={safePage === 1} onClick={() => goTo(safePage - 1)}><FontAwesomeIcon icon={faChevronLeft} /></button>
    {getPaginationPages(safePage, safeTotal).map((number) => <button type="button" key={number} className={number === safePage ? 'active' : ''} aria-label={`Page ${number}`} aria-current={number === safePage ? 'page' : undefined} onClick={() => goTo(number)}>{number}</button>)}
    <button type="button" className="pagination-arrow" aria-label="Next page" disabled={safePage === safeTotal} onClick={() => goTo(safePage + 1)}><FontAwesomeIcon icon={faChevronRight} /></button>
  </div>;
}