
import debug from "../comm/debug.js";
import Message from "../comm/message.js";
import TextChat from "../chat/text.js";
import getAIChat1 from "../service/openai1.js"

export default class Conversation {
  
    constructor() {
    }

    async urlconfig(req, res) {
        const message = new Message();
        message.urlSetting(req, res);
    }

    async process(body, res) {
        
        let chat = null;
        const data = body;
        const message = new Message();
        const xml = await message.decode(data);        
        const msgType = xml?.MsgType[0];
        debug.log(msgType,xml);

        if(msgType === "text") {
            chat = new TextChat(msgType,xml);
        }

        debug.log(!!chat);
        if(!!chat) {
            const answer = chat.process(xml, res);
            
            //comm.response(answer,res)
            return;
        }

        //debug.log("Not support msgtype []");
    }

    async invoke(body,res){
        console.log(body.message);
        var answer;
        var questionArr = [];
        questionArr = body.message;
        console.log(questionArr);
        getAIChat1(questionArr,body.openaiApiKey).then(result => {
//             console.log(result);
            const content = result?.data?.choices[0]?.message?.content;
            if (!!content) {
                answer = content;
                console.log(answer);
            } else {
                answer = '限制：3/分钟。请在20秒后再试。';
            }
            var result = {
                code:200,
                message:answer
            }
            res.write(JSON.stringify(result));
            res.status(200).end();
        });
    }  
}
