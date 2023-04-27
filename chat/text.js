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
export default class TextChat extends Chat {

    constructor(name) {
        super(name);
    }

    async process(xml, res) {
        debug.log("text chat...", xml);
        const question = xml?.Content[0];
        const toUser = xml?.FromUserName[0];

        debug.log(question);
        const message = new Message();
        message.reply(res, { type: 'text', content: '正在生成回答' }, toUser);

        //用Redis中获取用户上下文 toUser
        const client = redis.createClient({ url: process.env.REDIS });
        client.connect();
        console.log('IsReady:' + client.isReady);
        var questionArr = [];
        var historyMess = await client.get(toUser);
        if (historyMess !== null) {
            questionArr = JSON.parse(historyMess);
        }
        //构建message传入API  数组
        questionArr.push({ role: 'user', content: question });
        getAIChat(questionArr).then(result => {
            const content = result?.data?.choices[0]?.message?.content;
            if (!!content) {
                const answer = content;
                console.log(answer);
                questionArr.push({ role: 'assistant', content: answer });
                //调用企业微信接口，推送消息给用户
                message.sendMsg(answer, toUser);
            } else {
                const errmess = '限制：3/分钟。请在20秒后再试。';
                message.sendMsg(errmess, toUser);
                var leng = questionArr.length;
                questionArr.splice(0, leng - 1);
            }
        });
        if (questionArr.length > process.env.MAX) {
            questionArr = questionArr.splice(questionArr.length - process.env.MAX, questionArr.length);
        }
        await client.set(toUser, JSON.stringify(questionArr));
        //保存消息到Redis中，包括问题与回答
        await client.disconnect();
    }

}