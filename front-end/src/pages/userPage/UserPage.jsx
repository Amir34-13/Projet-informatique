import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useAuth } from "../../utils/AuthConext";
import "./userPage.css";

const UserProfile = () => {
  const { id } = useParams();
  const { token, userId } = useAuth();

  const [userData, setUserData] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isFollower, setIsFollower] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      console.log(token);
      const res = await axios.get(`http://localhost:3000/api/v1/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserData(res.data);
      setIsOwner(userId === id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = () => {
    if (!userData || isOwner) return;
    const isFollowing = userData.followers?.some((f) => f === userId);
    setIsFollower(isFollowing);
  };

  const toggleFollow = async () => {
    try {
      await axios.put(
        `http://localhost:3000/api/v1/users/${
          isFollower ? "unfollow" : "follow"
        }/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUser();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleBook = async (section, bookId) => {
    try {
      await axios.put(
        `http://localhost:3000/api/v1/user/addOrDelete${section}`,
        { id: bookId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUser();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [id, token]); // Ajout de token ici

  useEffect(() => {
    checkFollowStatus();
  }, [userData]);

  if (loading) return <div>Chargement...</div>;
  if (!userData) return <div>Utilisateur non trouvé</div>;

  return (
    <div className="profile-container">
      <div className="user-header">
        <img
          src={userData.profilePicture}
          alt="profil"
          className="profile-pic"
        />
        <h2>{userData.username}</h2>
        <p>{userData.bio}</p>
        <div className="counts">
          <span>
            {userData.followersCount || userData.followers?.length} abonnés
          </span>
          <span>
            {userData.followingCount || userData.following?.length} abonnements
          </span>
        </div>
        {!isOwner && (
          <button className="follow-btn" onClick={toggleFollow}>
            {isFollower ? "Se désabonner" : "S'abonner"}
          </button>
        )}
      </div>

      {(isFollower || isOwner) && (
        <div className="books-section">
          <BookSection
            title="Favoris"
            books={userData.favorite}
            isOwner={isOwner}
            section="Favorite"
            onToggle={toggleBook}
          />
          <BookSection
            title="En cours"
            books={userData.enCours?.map((e) => e.book)}
            isOwner={isOwner}
            section="EnCours"
            onToggle={toggleBook}
          />
          <BookSection
            title="Lus"
            books={userData.lus}
            isOwner={isOwner}
            section="Lu"
            onToggle={toggleBook}
          />
        </div>
      )}
    </div>
  );
};

const BookSection = ({ title, books, isOwner, section, onToggle }) => {
  if (!books || books.length === 0) return null;

  return (
    <div className="book-category">
      <h3>{title}</h3>
      <ul className="book-list">
        {books.map((book) => (
          <li key={book._id} className="book-item">
            <span>{book.title}</span>
            {isOwner && (
              <button onClick={() => onToggle(section, book._id)}>
                Supprimer
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserProfile;
