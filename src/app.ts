import express from "express";
import cookieParser from "cookie-parser";
import ai from "./routes/ai.routes";
import userRouter from "./routes/user.routes";
// import adminRouter from "./routes/admin.routes";
import { errorHandler } from "./middleware/errorHandlers";
import cors from "cors";

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/ai", ai);
app.use("/api/user", userRouter);
// app.use("/api/", adminRouter);
app.use(errorHandler);
export default app;
