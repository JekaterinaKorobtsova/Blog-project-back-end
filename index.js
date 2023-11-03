import express from "express";
import cors from 'cors';
import multer from 'multer';
import mongoose from "mongoose";
import { registerValidation, loginValidation, postCreateValidation } from "./validations.js";
import checkAuth from "./utils/checkAuth.js";
import * as UserController from "./controllers/UserController.js";
import * as PostController from "./controllers/PostController.js";
import * as CommentController from "./controllers/CommentController.js";
import handleValidationErrors from "./utils/handleValidationErrors.js";
import 'dotenv/config'


mongoose
  .connect(process.env.URI)
  .then(() => console.log("DB OK"))
  .catch((err) => console.log("DB error", err));

const app = express();
app.use(cors());

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.use(express.json());
app.use('/uploads', express.static('uploads'));



app.post("/auth/login", loginValidation, handleValidationErrors, UserController.login);
app.post("/auth/register", registerValidation, handleValidationErrors, UserController.register);
app.get("/auth/me", checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.get("/tags", PostController.getLastTags);

app.get("/popular-tags", PostController.getPopularTags);
app.get("/posts/tags/:tag", PostController.getPostsByTag);

app.get("/posts", PostController.getAll);
app.get("/posts/tags", PostController.getLastTags);
app.get("/posts/:id", PostController.getOne);
app.post("/posts", checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
app.delete("/posts/:id", checkAuth, PostController.remove);
app.patch("/posts/:id", checkAuth, postCreateValidation, handleValidationErrors, PostController.update);

app.post('/posts/:id', checkAuth, CommentController.createComment);
app.get('/posts/:id', CommentController.getAllComments);

app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log("server OK");
});
