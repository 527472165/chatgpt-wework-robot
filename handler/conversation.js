
import debug from "../comm/debug.js";
import Message from "../comm/message.js";
import TextChat from "../chat/text.js";
import redis from 'redis';

export default class Conversation {
  
    constructor() {
    }

    async urlconfig(req, res) {
            // 连接 Redis
            const client =redis.createClient({url: process.env.REDIS});
            // client.on('error', err => console.log('Redis Client Error', err));
            await client.connect();
            console.log(client.isOpen);
            console.log(client.isReady);
            await client.set('abcd','11111');
            const value = await client.get('abcd');
            console.log(value) 
            await client.disconnect();
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

    
}