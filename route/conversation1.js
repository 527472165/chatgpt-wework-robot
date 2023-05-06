
import debug from "../comm/debug.js";
import Conversation from "../handler/conversation.js";

import express from "express";
const router = express.Router();

router.use('/', function(req, res, next) {
	let method = req.method;
	if(method == 'POST') {
		debug.log(`------------------------ROUTER MSG [CONVERSATION]-------------------------`);
		const conversation = new Conversation();
		conversation.invoke(req.body, res);
	}else{
		res.end();
	}
});

export default router;

