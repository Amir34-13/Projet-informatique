const User = require("../modules/userModel"); 
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Review =require('../modules/reviewModel') ;
 const bcrypt = require("bcrypt");
const Book=require('../modules/bookModel');
const { deleteFile } = require("../utils/deleteFile");
const path = require("path");
exports.createUser = asyncHandler(async (req, res, next) => {

  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    return next(new ApiError("Cet email est déjà utilisé", 400));
  }
   req.body.password = await bcrypt.hash(req.body.password, 12);
  
  const user = await User.create(req.body);

  res.status(201).json(user);
});

const ApiFeatures = require("../utils/apiFeatures");

exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const documentsCount=await User.countDocuments();
  const apiFeatures = new ApiFeatures(
    User.find().select("-password"),
    req.query
  )
    .filter()
    .search()
    .sort()
    .paginate(documentsCount); 

  const users = await apiFeatures.mongooseQuery;

  res.status(200).json({
    status: "success",
    results: users.length,
    pagination: apiFeatures.paginationResult,
    data: users,
  });
});


exports.getUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const requestingUserId = req.user._id; 
  const requestingUserRole = req.user.role; 

  const user = await User.findById(id).select('-password');
  if (!user) {
    return next(new ApiError("Utilisateur introuvable", 404));
  }

  let responseData;

  const isAdmin = requestingUserRole === "admin";
  console.log(isAdmin);
  const isFollower = user.followers.some(
    (follower) => follower.toString() === requestingUserId.toString()
  );

  if (isAdmin || isFollower) {
    responseData = user.toObject(); 
    delete responseData.passwordChangedAt;
    delete responseData.passwordResetCode;
    delete responseData.passwordResetExpires;
    delete responseData.passwordResetVerified;
    delete responseData.email;
  } else {
    responseData = {
      username: user.username,
      bio: user.bio,
      profilePicture: user.profilePicture,
      followersCount: user.followers.length,
      followingCount: user.following.length,
    };
  }

  res.status(200).json(responseData);
});


exports.updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { username, email, role, bio } = req.body;
  const requestingUserId = req.user._id; 

  

  const isAdmin=req.user.role==='admin';
  const user = await User.findById(id);
  if (!user) {
    return next(new ApiError("Utilisateur introuvable", 404));
  }
  if (!isAdmin && requestingUserId.toString()!== user._id.toString()) {
    return next(new ApiError("Unauthorized to update this user", 401));
  }

  if (username) user.username = username;
  if (email) user.email = email;
  if (role) user.role = role; 
  if (bio) user.bio = bio;
  if (req.file) user.profilePicture = `/uploads/${req.file.filename}`;


  await user.save();

  res.status(200).json(user);
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const requestingUserId = req.user._id;
  const isAdmin = req.user.role === "admin";
  if (!isAdmin && requestingUserId.toString() !== id.toString()) {
    return next(new ApiError("Unauthorized to delete this user", 401));
  }
  const reviewsUser = await Review.find({ user: id });

  for (const review of reviewsUser) {
    let book =await Book.findByIdAndUpdate(
      review.book,
      { $pull: { reviews: review._id } },
      { new: true }
    );
     
     book.updateAverageRating();
    //  await book.save();

  }
   
await Review.deleteMany({ user: id });

await User.updateMany(
  { following: id },
  { $pull: { following: id } }
);

await User.updateMany(
  { followers: id },
  { $pull: { followers: id } }
);

const reviews = await Review.find({ "replies.user": id });
for (const review of reviews) {
  review.replies = review.replies.filter(
    (reply) => reply.user.toString() !== id.toString()
  );
  await review.save();
}
  const user = await User.findOneAndDelete({ _id: id });

const filePath = path.join(__dirname, "..", user.profilePicture);

  deleteFile(filePath);


  if (!user) {
    return next(new ApiError("Utilisateur introuvable", 404));
  }

  res.status(200).json({ message: "Utilisateur supprimé avec succès" });
});
exports.followOrUnfollow=(option)=>asyncHandler(
  async (req, res, next) => {
    const { id } = req.params;
    const requestingUserId = req.user._id;
    if (id.toString() === requestingUserId){
      return next(new ApiError("Vous ne pouvez pas vous abonner à vous-même", 400));
    }
    const user = await User.findById(id);
    const follower= await User.findById(requestingUserId);
    console.log(follower);
    if (!user) {
      return next(new ApiError("Utilisateur introuvable", 404));
    }
    if(option==='follow'){
      if (user.followers.includes(requestingUserId) && follower.following.includes(id)){
        return next(new ApiError("Vous êtes déjà abonné à cet utilisateur", 400));
      }
      user.followers.push(requestingUserId);
      follower.following.push(id);

      

    } else if(option==='unfollow') {
      if (!user.followers.includes(requestingUserId) && !follower.following.includes(id)){
        return next(new ApiError("Vous ne suivez pas cet utilisateur", 400));
      }
      user.followers = user.followers.filter(
        (follower) => follower.toString() !== requestingUserId.toString()
      );
      follower.following = follower.following.filter(
        (following) => following.toString() !== id.toString()
      );
    }
    await user.save();
    await follower.save();
    res.status(200).json("");
  }
)
