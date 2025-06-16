import verifyAdminToken from "../middleware/verifyAdminToken";
import { Router } from "express";
import { getAllUsers, getUserById } from "../controllers/admin.controller";
import { ro } from "@faker-js/faker/.";
const router = Router();

router.get("/admin", verifyAdminToken, (req, res) => {
  res.status(200).json({ message: "Welcome to the admin area!" });
});

router.get("/get-all-users", verifyAdminToken, getAllUsers);
router.get("/article-by-user/:id", verifyAdminToken, getUserById);
export default router;
