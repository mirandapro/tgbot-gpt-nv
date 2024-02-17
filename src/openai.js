//import { Configuration, OpenAIApi } from "openai";
import config from 'config'
import { createReadStream } from 'fs'
import OpenAI from "openai";

class OpenAIApi {
roles = {
    ASSISTANT: 'assistant',
    USER: 'user',
    SYSTEM: 'system',
}

    constructor(apiKey) {
//     const configuration = new Configuration({
//        apiKey,
//     })
//     this.openai = new OpenAIApi(configuration);
       this.openai = new OpenAI(apiKey);
    }

   async chat(messages) {
    try {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages,
        })
//      console.log(response)
        return response.choices[0].message
    } catch(e) {
        console.log('Error while gpt chat', e.message)
    }

    }

    async transcription(filepath) {
        try {
//          console.log(filepath);
            const response = await this.openai.audio.transcriptions.create({
                file: createReadStream(filepath),
                model: 'whisper-1',
            })
            return response.text
        } catch (e) {
            console.log('Error while transcription', e.message)
        }
    }
}

export const openai = new OpenAIApi({
    apiKey: config.get('OPENAI_API_KEY'),
})