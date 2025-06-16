// models/User.ts
import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { toJSONPlugin } from "../utils/toJSONPlugin";

interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  articles: mongoose.Types.ObjectId[];
  generateAccessToken(): string;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  _id: { type: Schema.Types.ObjectId, auto: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  articles: [{ type: Schema.Types.ObjectId, ref: "Article" }],
});

UserSchema.plugin(toJSONPlugin);

// Hash password before saving user
UserSchema.pre<IUser>("save", async function (next) {
  if (this.isModified("password")) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

UserSchema.methods.generateAccessToken = function (): string {
  const payload = {
    id: this._id,
    email: this.email,
  };
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });
};
UserSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

const User: mongoose.Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export { User, IUser };
