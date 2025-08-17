import dotenv from 'dotenv';

dotenv.config();

const keys = {
    openAiKey: process.env.OPENAI_API_KEY
};

export default keys;
