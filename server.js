// const path = require("path");
// const hpp = require("hpp");

const rateLimit = require("express-rate-limit");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");
const authRoute = require("./routes/authRoute");

dotenv.config();
const dbConnection = require("./config/dbConfig");
const app = express();
const PORT = process.env.PORT || 3000;
dbConnection();

// Enable other domains to access your application

app.use(cors());
app.options("*", cors());

// compress all responses
app.use(compression());

// Checkout webhook
// app.post(
//   '/webhook-checkout',
//   express.raw({ type: 'application/json' }),
//   webhookCheckout
// );

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Limit each IP to 100 requests per `window` (here, per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message:
    "Too many accounts created from this IP, please try again after an hour",
});

// Apply the rate limiting middleware to all requests
app.use("/api", limiter);

app.use(express.json({ limit: "20kb" }));

app.use("api/v1/", authRoute);

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});
