import OpenAI from 'openai';
import keys from '../utils/keys';
import { zodResponseFormat } from "openai/helpers/zod";
import { ScanDocDataItem } from '../models/ScanDocDataItem';
import { z } from 'zod';

const responseSchema = zodResponseFormat(
    z.object({
        data: z.array(
            z.object({
                amount: z.number().describe("The amount of the transaction"),
                timestamp: z.nullable(z.number()).describe("The timestamp of the transaction"),
                note: z.nullable(z.string()).describe("The notes of the transaction")
                // label: z.array(z.string()).describe("The label IDs of the transaction")
            })
        )
    }),
    "transaction"
);

const model = "gpt-4o-mini";
const ai = () => {
    const apiKey = keys.openAiKey;
    return new OpenAI({
        apiKey: apiKey
    });
};

export const scanDocument = async(
    items: ScanDocDataItem[],
    originalImageDimensions: { width: number; height: number },
    labels: Map<string, string>
) => {
    // TODO: add these to prompts
    const labelsText = `The labels are as follows:
        ${Array.from(Object.entries(labels)).map(([id, name]) => `- ${id}: ${name}`).join("\n")}`

    // console.info("Retrieving suggestions with items:", items);

    const prompt = `
        The fields of the transaction are as follows:
        - amount: The amount of the transaction (number)
        - timestamp: The timestamp of the transaction (in epoch milliseconds, null if not available), if you can scan the hour and minute, assume the date is today, and UTC+7 timezone, otherwise, if you can only recognize the date, assume the time is 09:00:00 of that date, and UTC+7 timezone)
        - note: The notes of the transaction (string, null if not available)

        The original image dimensions are (w:h): ${originalImageDimensions.width}x${originalImageDimensions.height}.
        
        The OCR data is as follows:
        ${JSON.stringify(items)}
    `;

    console.info("Prompt for OpenAI:", prompt);

    const response = await ai().chat.completions.create({
        model: model,
        messages: [
            {
                role: "system",
                content: [{
                    type: "text", 
                    text: "You are a personal finance manager who can read transaction information written on paper."
                }, {
                    type: "text", 
                    text: "You are provided with a list of OCR-extracted texts accompanied by their coordinates, relative to the receipt photo's top-left origin. The original image dimensions are also provided."
                }, {
                    type: "text", 
                    text: "Based on their relative position on the receipt, categorize the texts into transaction amount (currency being VND, thousand separator being comma or period), date time of transaction, and note."
                }, {
                    type: "text", 
                    text: "Then create transaction objects with the specified fields."
                }]
            },
            {
                role: "user",
                content: [
                    { type: "text", text: prompt }
                ]
            }
        ],
        response_format: responseSchema,
    });

    console.info("Response received from OpenAI:", response.choices[0].message);

    const content = response.choices[0].message.content!;
    return JSON.parse(content)["data"];
};