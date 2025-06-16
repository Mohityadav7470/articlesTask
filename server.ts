import app from "./src/app";
import dotenv from "dotenv";
import connectDB from "./src/config/db";
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
  .catch((error) => {
    console.error(`Error connecting to MongoDB: ${error}`);
    process.exit(1);
  });
