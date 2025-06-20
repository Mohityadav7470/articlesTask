// models/Article.ts
import mongoose, { Document, Schema } from "mongoose";
import { toJSONPlugin } from "../utils/toJSONPlugin";

export interface IArticle extends Document {
  title: string;
  description: string;
  user: mongoose.Types.ObjectId;
  versions: mongoose.Types.ObjectId[];
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const articleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    versions: [{ type: Schema.Types.ObjectId, ref: "ArticleVersion" }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
articleSchema.plugin(toJSONPlugin);
export const Article = mongoose.model<IArticle>("Article", articleSchema);
