import {
  registerUser,
  loginUser,
  logoutUser,
  createArticle,
  listArticles,
  updateArticle,
  listOlderVersions,
  deleteArticle,
} from "../controllers/user.controller";
import { Router } from "express";
import { verifyAccessToken } from "../middleware/verifyAccessToken";

const router = Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);

//Article routes
router.post("/create-article", verifyAccessToken, createArticle);
router.get("/list-articles", verifyAccessToken, listArticles);
router.post("/update-article/:id", verifyAccessToken, updateArticle);
router.get("/list-older-versions/:id", verifyAccessToken, listOlderVersions);
router.post("/delete-article/:id", verifyAccessToken, deleteArticle);
export default router;
