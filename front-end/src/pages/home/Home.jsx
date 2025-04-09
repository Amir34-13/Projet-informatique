import "./home.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const BookCard = ({ book }) => {
  const navigate = useNavigate();
  return (
    <div className="book-card" onClick={()=>navigate(`/book/${book._id}`)}> 
      <img src={`http://localhost:3000${book.coverImage}`} alt={book.title} />
      <h3>{book.title}</h3>
      <p>⭐ {book.averageRating} / 5</p>
    </div>
  );
};

export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const booksPerPage = 10;

  // Fonction pour récupérer les livres avec pagination
  const fetchBooks = (page) => {
    setLoading(true);
    axios
      .get(
        `http://localhost:3000/api/v1/book?page=${page}&limit=${booksPerPage}`
      )
      .then((response) => {
        setBooks(response.data.data);
        setTotalPages(response.data.paginationResult.numberOfPages);
        console.log(response.data.data)
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des livres :", error);
        setError("Impossible de charger les livres.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBooks(currentPage);
  }, [currentPage]);

  if (loading) return <p>Chargement des livres...</p>;
  if (error) return <p>{error}</p>;

  // Fonction pour générer la pagination avec "..."
  const generatePageNumbers = () => {
    const pages = [];
    // const maxPagesToShow = 5; // Nombre max de pages affichées (hors "...")
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) pages.push(1);
    if (startPage > 2) pages.push("...");

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) pages.push("...");
    if (endPage < totalPages) pages.push(totalPages);

    return pages;
  };

  return (
    <div className="home-container">
      <h2>Nos Livres</h2>
      <div className="books-grid">
        {books.map((book) => (
          <BookCard key={book._id} book={book} />
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          ⬅️ Précédent
        </button>

        {generatePageNumbers().map((page, index) =>
          page === "..." ? (
            <span key={index} className="dots">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={currentPage === page ? "active" : ""}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Suivant ➡️
        </button>
      </div>
    </div>
  );
}
