import express from "express";
import testRouter from "./routes/test";
import scanDocRouter from "./routes/scan-doc";

const app = express();

app.use(express.json({limit: "1mb"}));
app.use("/api/test", testRouter);
app.use("/api/v1/scan-doc", scanDocRouter);

export default app;