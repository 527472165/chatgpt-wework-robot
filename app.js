import express from "express";
import { config } from "dotenv";
import debug from "./comm/debug.js";
import bodyParser from 'body-parser';
import bodyParserXml from 'body-parser-xml';

import { initAccessToken } from "./comm/config.js";
import conversation from "./route/conversation.js";
import conversation1 from "./route/conversation1.js";
import { constants } from "crypto";


config();
bodyParserXml(bodyParser);

const app = express();
// const PORT = process.env.PORT;
const PORT = 6060;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.xml());

/*health check for render*/
app.get('/healthz', function (req, res, next) {
    res.status(200).end();
});

app.use('/message',conversation);

app.use('/chatApi',conversation1);

app.post('/chat', (req, res) => {
	const messages = req.body.messages;
    const key = req.body.openaiApiKey;
    const options = {
    url: 'https://api.openai.com/v1/chat/completions',
    method: 'POST',
    headers: {
			"Authorization": "Bearer "+key,
			"Content-Type": "application/json",
    },
    json: {
			"model": "gpt-3.5-turbo",
			"stream": true,
			"messages": messages
    }
  };
	const proxyReq = request(options);
    proxyReq.on('response', function(response) {
    response.pipe(res);
  });
});

/*init access_token*/
initAccessToken();

app.listen(PORT, () => {
    debug.out(`Server Running on Port:${PORT}`);
});