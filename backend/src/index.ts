import express from "express";
import userRouter from "./routers/user";
import workerRouter from "./routers/worker";
const app = express();

app.use("/v1/user", userRouter);
app.use("/v1/useworker", workerRouter);

export const JWT_SECRET = "mysecretkey";

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});