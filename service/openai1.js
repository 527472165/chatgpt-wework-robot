
import { Configuration, OpenAIApi } from "openai";

const models = ['text-davinci-003','code-davinci-002','gpt-3.5-turbo'];

const getAIChat1 = async (getAIChat,openaiApiKey) => {

const configuration = new Configuration({
    apiKey: openaiApiKey,
});

const openai = new OpenAIApi(configuration);
    try {
        const res = await openai.createChatCompletion({
            model: models[2],
            messages:getAIChat
//             stream:true
        })
        return res;
    }
    catch(error) {
        console.log("OpenAI happen error!");
        console.log(error?.response?.data?.error);
    }

};

export default getAIChat1;
