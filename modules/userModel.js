const mongoose = require("mongoose");
const bcrypt= require('bcrypt');
// Définition du schéma utilisateur
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true, // Supprime les espaces en début/fin
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // Convertit automatiquement en minuscule
      match: [/.+\@.+\..+/, "Veuillez entrer une adresse email valide."],
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // Définit une longueur minimale
    },
    bio: {
      type: String,
      maxlength: 250, // Longueur maximale de la bio
    },
    profilePicture: {
      type: String, // URL de la photo de profil
      default: "https://example.com/default-profile-picture.png",
    },
    followers: [
      { type: mongoose.Schema.ObjectId, ref: "User" }, // Référence à d'autres utilisateurs
    ],
    following: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    role: {
      type: String,
      enum: ["user", "manager", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
    
    favorite: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Book",
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // Hashing user password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model("User", userSchema);
