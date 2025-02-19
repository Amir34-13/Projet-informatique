const mongoose = require("mongoose");
const Review = require("./reviewModel");
const User= require('./userModel');
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: String,
    required: true,
    trim: true,
  },
  nbrPage:{
    type: Number,
    required: true,
    min: 1,
    max: 10000,
  },
  genre: {
    type: [String], 
    required: true,
  },
  description: {
    type: String,
    maxlength: 1000,
    required: false,
  },
  publicationDate: {
    type: Date,
    required: false,
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }], 
  coverImage: { type: String },
  updatedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});






bookSchema.methods.updateAverageRating = async function () {
const Review = require("./reviewModel");
  const reviews = await Review.find({ book: this._id });
    console.log(this._id);

  console.log(reviews);
  if (reviews.length === 0) {
    this.averageRating = 0;
    return await this.save();
  }

  const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  this.averageRating = averageRating;

  await this.save();
};

// bookSchema.pre("findByIdAndDelete", async function (next) {

//   try {
//     await Review.deleteMany({ book: this._id });
//     await User.updateMany(
//       {},
//       {
//         $pull: {
//           favorite: this._id,
//           lus: this._id,
//           enCours: { book: this._id },
//         },
//       }
//     );
//     next();
//   } catch (error) {
//     next(error);
//   }
// });




// bookSchema.post("save", async function () {
//   await this.updateAverageRating();
// });

module.exports = mongoose.model("Book", bookSchema);
