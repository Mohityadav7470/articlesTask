import app from "./src/app";
import dotenv from "dotenv";
import connectDB from "./src/config/db";
import seed from "./src/seed/adminSeeder";
import { userSeeder } from "./src/seed/userSeeder";
dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .then(seed)
  .then(() => userSeeder(5, 5, 2))
  .catch((error) => {
    console.error(`Error connecting to MongoDB: ${error}`);
    process.exit(1);
  });
