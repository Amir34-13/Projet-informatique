const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true, // Supprime les espaces en début/fin
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    genre: {
      type: [String], // Tableau de genres (ex : ["Fiction", "Mystère"])
      required: true,
    },
    description: {
      type: String,
      maxlength: 1000, // Limite la longueur de la description
    },
    publicationDate: {
      type: Date, // Date de publication du livre
    },
    averageRating: {
      type: Number,
      default: 0, // Note moyenne initiale
      min: 0,
      max: 5,
    },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Référence à un utilisateur
        comment: { type: String, required: true }, // Avis de l'utilisateur
        rating: { type: Number, min: 1, max: 5, required: true }, // Note de 1 à 5
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }, // Mise à jour automatique de la date de modification
      },
    ],
  },
  { timestamps: true }
); // Ajoute createdAt et updatedAt automatiquement

bookSchema.methods.updateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
  } else {
    const totalRating = this.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    this.averageRating = (totalRating / this.reviews.length).toFixed(2); // Arrondi à 2 décimales
  }
  return this.save();
};

bookSchema.post("save", async function () {
  await this.updateAverageRating();
});

// Export du modèle
module.exports = mongoose.model("Book", bookSchema);
