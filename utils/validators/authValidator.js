const { check } = require("express-validator");
const validatorMiddleware =require("../../middlewares/validatorMiddlewares");
const validateUserRegistration = [
  check("username")
    .trim()
    .notEmpty()
    .withMessage("Le nom d’utilisateur est requis.")
    .isLength({ min: 3, max: 30 })
    .withMessage(
      "Le nom d’utilisateur doit contenir entre 3 et 30 caractères."
    ),

  check("email")
    .trim()
    .notEmpty()
    .withMessage("L’email est requis.")
    .isEmail()
    .withMessage("L’email doit être valide."),

  check("password")
    .trim()
    .notEmpty()
    .withMessage("Le mot de passe est requis.")
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit contenir au moins 6 caractères."),

  check("bio")
    .optional()
    .isLength({ max: 250 })
    .withMessage("La bio ne doit pas dépasser 250 caractères."),

  check("profilePicture")
    .optional()
    .isURL()
    .withMessage("L’URL de la photo de profil doit être valide."),

  check("role")
    .optional()
    .isIn(["user", "manager", "admin"])
    .withMessage('Le rôle doit être "user", "manager" ou "admin".'),
  validatorMiddleware,
];

const validateUserLogin = [
  check("email")
    .trim()
    .notEmpty()
    .withMessage("L’email est requis.")
    .isEmail()
    .withMessage("L’email doit être valide."),

  check("password")
    .trim()
    .notEmpty()
    .withMessage("Le mot de passe est requis.")
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit contenir au moins 6 caractères."),
  validatorMiddleware,
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
};
