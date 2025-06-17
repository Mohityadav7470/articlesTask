import mongoose from "mongoose";
import { User } from "../model/user.model";
import { Article,IArticle } from "../model/article.model";
import { ArticleVersion } from "../model/articleVersion.model";
import { faker } from "@faker-js/faker";


export const userSeeder = async (
  totalUser: number,
  totalArticles: number,
  totalVersions: number
) => {
  try {
    const existsUser = await User.find({ role: "user" }).countDocuments();
    if (existsUser > 0) {
      console.log("User already exists. Skipping seeding.");
      return;
    }
    let allUsers: object[] = [];
    for (let i = 0; i < totalUser; i++) {
      // fake user created
      const name = faker.person.firstName();
      const email = faker.internet.email();
      const password = faker.internet.password();
      const role = "user";
      const newUser = new User({ name, email, password, role });
      allUsers.push({ email, password });
      await newUser.save();

      // fake articles
      for (let j = 0; j < totalArticles; j++) {
        const title = faker.lorem.sentence();
        const description = faker.lorem.paragraphs(3);
        const article: IArticle = new Article({
          title,
          description,
          user: newUser._id,
        });

        await article.save();

        // Step 2: Create the first version
        const version = new ArticleVersion({
          article: article._id,
          description,
        });

        await version.save();

        article.versions.push(version._id as mongoose.Types.ObjectId);
        await article.save();

        // Step 4: Link article to user
        await User.findByIdAndUpdate(newUser._id, {
          $push: { articles: article._id },
        });

        // fake versions
        for (let k = 0; k < totalVersions; k++) {
          const newDescription = faker.lorem.paragraphs(3);
          const newVersion = new ArticleVersion({
            article: article._id,
            description: newDescription,
            updatedAt: new Date(),
          });

          await newVersion.save();
          article.versions.push(newVersion._id as mongoose.Types.ObjectId);
          await article.save();
        }
      }
    }
    return allUsers;
  } catch (error) {
    return console.error("Error seeding database:", error);
  }
};