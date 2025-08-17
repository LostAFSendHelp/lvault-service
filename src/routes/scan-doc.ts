import { Router, Request, Response } from "express";
import { scanDocument } from "../adapters/openai-scan";
import { ScanDocDataItem } from "../models/ScanDocDataItem";

const router = Router();

interface ScanDocRequest extends Request {
    body: {
        items: ScanDocDataItem[];
        originalImageDimensions: {
            width: number;
            height: number;
        };
        labels: Map<string, string>;
    }
}

router.post("/", async (req: ScanDocRequest, res: Response) => {
    const { items, originalImageDimensions, labels } = req.body;

    console.info("Received scan document request: ", req.body);

    const transactions = await scanDocument(items, originalImageDimensions, labels);

    res.json({
        data: transactions
    });
});

export default router;