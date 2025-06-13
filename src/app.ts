import express from 'express';
import cookieParser from 'cookie-parser';
import ai from './routes/ai.routes';
import userRouter from './routes/user.routes';
import { errorHandler } from './middleware/errorHandlers'

const app = express();


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));



app.use("/api/ai", ai)
app.use("/api/user", userRouter);
app.use(errorHandler);
export default app;