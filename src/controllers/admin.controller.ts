import { Request, Response } from "express";
import { User } from "../model/user.model";
import { Article } from "../model/article.model";
import { seeder } from "../seed/userSeeder";
const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUserById = async (req: Request, res: Response) => {
  const userId = req.params.id;

  try {
    const user = await Article.find({ user: userId, isDeleted: false });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const generateFakeUser = async (req: Request, res: Response) => {
    try {
        const user = seeder(5,5,2);
        res.status(201).json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to generate fake user" });
        return;
    }
}

export { getAllUsers, getUserById, generateFakeUser };
