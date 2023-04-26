"use strict"

import Chat from "./chat.js";
import debug from "../comm/debug.js";

/*to do more soon...*/
import Message from "../comm/message.js";
import getAIChat from "../service/openai.js"

/**redis */
import redis from 'redis';
import { config } from "dotenv";
config()
export default class TextChat extends Chat{
  
    constructor(name) {
        super(name);
    }

    async process(xml, res) {
        debug.log("text chat...", xml);
        const question = xml?.Content[0];
        const toUser = xml?.FromUserName[0];

        debug.log(question);
        const message = new Message();
        message.reply(res, { type: 'text', content: '正在生成回答...' }, toUser);

        //用Redis中获取用户上下文 toUser
        const client = redis.createClient({ url: process.env.REDIS});
        client.connect();
        var questionArr = [];
        var historyMess = await client.get(toUser);
        if (result !== "" || result !== null) {
            questionArr.push(JSON.parse(historyMess));
        }
        //构建message传入API  数组
        questionArr.push({role:'user',content:question});
        getAIChat(questionArr).then(result => {
            const content = result?.data?.choices[0]?.message?.content;
            if (!!content) {
                const answer = content;
                debug.log(answer);
                console.log(answer);
                //调用企业微信接口，推送消息给用户
                message.sendMsg(answer, toUser);
                questionArr.push({role:'assistant',content:answer});
                //todo questiionArr 做限制
        
   
            }
        });
        //保存消息到Redis中，包括问题与回答
        await client.set(toUser, JSON.stringify(questionArr));
        await client.disconnect();
    }

}