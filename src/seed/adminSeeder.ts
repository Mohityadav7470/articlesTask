import mongoose from "mongoose";
import connectDB from "../config/db";
import { de, faker } from "@faker-js/faker";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User, IUser } from "../model/user.model";
import { Article } from "../model/article.model";
import { ArticleVersion } from "../model/articleVersion.model";
import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

connectDB();
const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};

const seed = async () => {
  try {
    const existsAdmin = await User.findOne({ role: "admin" });
    if (existsAdmin) {
      console.log("Admin user already exists. Skipping seeding.");
      return;
    }

    const admin: IUser = await User.create({
      name: "Admin",
      email: "admin@example.com",
      role: "admin",
      password: "admin123",
    });

    const adminToken = generateToken(admin._id.toString());
    console.log(`Admin JWT: ${adminToken}`);

    console.log("Seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("Error during seeding:", err);
    process.exit(1);
  }
};

export default seed;
