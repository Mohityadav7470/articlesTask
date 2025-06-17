// import verifyAdminToken from "../middleware/verifyAdminToken";
// import { Router } from "express";
// import {
//   getAllUsers,
//   getUserById,
//   generateFakeUser,
// } from "../controllers/admin.controller";

// const router = Router();

// router.get("/admin", verifyAdminToken, (req, res) => {
//   res.status(200).json({ message: "Welcome to the admin area!" });
// });
// router.post("/generate-fake-user", verifyAdminToken, generateFakeUser);
// router.get("/get-all-users", verifyAdminToken, getAllUsers);
// router.get("/article-by-user/:id", verifyAdminToken, getUserById);
// export default router;
