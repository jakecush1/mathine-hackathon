import express from "express";

const router = express.Router();

router.use((req, res, next) => {
  console.log('Autograder router received a request for:', req.originalUrl);
  next();
});

router.get("/", (req, res) => {
  res.send("Test route is working!");
});

export default router;