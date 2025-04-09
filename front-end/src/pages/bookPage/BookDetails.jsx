import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../utils/AuthConext";
import axios from "axios";
import "./bookDetails.css";

export default function BookDetail() {
  const { id } = useParams();
  const { token, userId } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReplies, setShowReplies] = useState({});
  const [userReview, setUserReview] = useState(null);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [editingReview, setEditingReview] = useState(false);
  const [responseText, setResponseText] = useState({});
  const [pagesRead, setPagesRead] = useState(0); //
  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/v1/book/${id}`)
      .then((response) => {
        setBook(response.data);
        console.log(userId)
        const foundReview = response.data.reviews.find(
          (review) => review.user._id === userId
        );

        console.log(response.data);

        setUserReview(foundReview);
        if (foundReview) {
          setNewReview(foundReview.comment);
          setNewRating(foundReview.rating);
          setEditingReview(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Livre non trouvé");
        setLoading(false);
      });

  }, [id, userId]);

  const toggleReplies = (reviewId) => {
    setShowReplies((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const handleReviewSubmit = async () => {
    try {
      if (editingReview) {
        await axios.put(
          `http://localhost:3000/api/v1/review/${userReview._id}`,
          { comment: newReview, rating: newRating },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `http://localhost:3000/api/v1/review`,
          { bookId: id, comment: newReview, rating: newRating },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      const newReviewData = {
        comment: newReview,
        rating: newRating,
        user: { _id: userId, username: "Vous" }, // Tu peux remplacer "Vous" par le username réel si tu l’as
        replies: [],
      };

      setUserReview(newReviewData);
      setEditingReview(true);

      // Facultatif : mets à jour aussi book.reviews pour affichage immédiat
      setBook((prev) => ({
        ...prev,
        reviews: [newReviewData, ...prev.reviews],
      }));

    } catch (error) {
      console.error("Erreur lors de l'envoi de l'avis :", error);
    }
  };

  const handleDeleteReview = async () => {
    try {
      await axios.delete(
        `http://localhost:3000/api/v1/review/${userReview._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'avis :", error);
    }
  };

  const handleResponseSubmit = async (reviewId) => {
    try {
      await axios.post(
        `http://localhost:3000/api/v1/response`,
        { reviewId, comment: responseText[reviewId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResponseText({ ...responseText, [reviewId]: "" });
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors de l'envoi de la réponse :", error);
    }
  };

  const handleDeleteResponse = async (responseId,reviewId) => {
    try {
      console.log(token)
      await axios.delete(`http://localhost:3000/api/v1/response/`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { reviewId, responseId },
      });

      window.location.reload();
    } catch (error) {
      console.error("Erreur lors de la suppression de la réponse :", error);
    }
  };

   const toggleBookStatus = async (type) => {
     if (!token) return alert("Connectez-vous d'abord !");
     try {
       await axios.put(
         `http://localhost:3000/api/v1/book/addOrDelete${type}`,
        { id },
         { headers: { Authorization: `Bearer ${token}` } }
       );
       alert(`${type} mis à jour avec succès`);
     } catch (err) {
       alert(`Erreur lors de la mise à jour de ${type}`);
     }
   };
  if (loading) return <p>Chargement...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="book-detail-container">
      <div className="book-info">
        <img
          src={`http://localhost:3000${book.coverImage}`}
          alt={book.title}
          className="book-cover"
        />
        <div className="book-details">
          <h2>{book.title}</h2>
          <p>
            <strong>Auteur:</strong> {book.author}
          </p>
          <p>
            <strong>Nombre de pages:</strong> {book.nbrPage}
          </p>
          <p>
            <strong>Genres:</strong> {book.genre.join(", ")}
          </p>
          <p>
            <strong>Date de publication:</strong> {book.publicationDate}
          </p>
          <p>
            <strong>Note moyenne:</strong> ⭐ {book.averageRating} / 5
          </p>
          <p className="description">
            <strong>Description:</strong> {book.description}
          </p>

          {token && (
            <div className="status-buttons">
              <button onClick={() => toggleBookStatus("Favorite")}>
                ❤️ Favori
              </button>
              <button onClick={() => toggleBookStatus("lu")}>📘 Lu</button>
              <button onClick={() => toggleBookStatus("EnCours")}>
                📖 En cours
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Ajouter / modifier l’avis */}
      {token && (
        <div className="add-review">
          <h3>{editingReview ? "Modifier votre avis" : "Ajouter un avis"}</h3>
          <textarea
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            placeholder="Votre avis..."
          />
          <select
            value={newRating}
            onChange={(e) => setNewRating(Number(e.target.value))}
          >
            {[5, 4, 3, 2, 1].map((rate) => (
              <option key={rate} value={rate}>
                ⭐ {rate}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            max={book.nbrPage}
            value={pagesRead}
            onChange={(e) => setPagesRead(e.target.value)}
            placeholder="Pages Lues"
          />
          <button onClick={handleReviewSubmit}>Publier</button>
          {editingReview && (
            <button className="delete-btn" onClick={handleDeleteReview}>
              Supprimer
            </button>
          )}
        </div>
      )}

      {/* Section avis */}
      <div className="reviews-section">
        <h3>Avis des lecteurs</h3>
        {book.reviews.length === 0 ? (
          <p>Aucun avis pour ce livre.</p>
        ) : (
          book.reviews.map((review) => (
            <div key={review._id} className="review-card">
              <p>
                <strong>{review.user.username}</strong>: {review.comment}
              </p>
              <p>⭐ {review.rating}</p>

              {/* Réponses */}
              {review.replies?.length > 0 && (
                <>
                  <button onClick={() => toggleReplies(review._id)}>
                    {showReplies[review._id]
                      ? "Masquer les réponses"
                      : "Voir les réponses"}
                  </button>
                  {showReplies[review._id] && (
                    <div className="review-replies">
                      {review.replies.map((reply) => (
                        <div key={reply._id}>
                          <p>
                            <strong>{reply.user.username}</strong>:{" "}
                            {reply.comment}
                            {token && reply.user._id === userId && (
                              <button
                                onClick={() =>
                                  handleDeleteResponse(reply._id, review._id)
                                }
                              >
                                Supprimer
                              </button>
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Formulaire de réponse */}
              {token && (
                <div className="reply-form">
                  <textarea
                    placeholder="Répondre..."
                    value={responseText[review._id] || ""}
                    onChange={(e) =>
                      setResponseText({
                        ...responseText,
                        [review._id]: e.target.value,
                      })
                    }
                  />
                  <button onClick={() => handleResponseSubmit(review._id)}>
                    Répondre
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
