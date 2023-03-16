module.exports = {
	config: {
		name: "ايموجي", // Name of command, it must be unique to identify with other commands
		version: "1.0", // Version of command
		author: "Eslam", // Author of command
		countDown: 5, // Time to wait before executing command again (seconds)
		role: 0, // Role of user to use this command (0: normal user, 1: admin box chat, 2: owner bot)
		shortDescription: {
			vi: "đây là mô tả ngắn của lệnh",
			en: "this is short description of command"
		}, // Short description of command
		longDescription: {
			vi: "đây là mô tả dài của lệnh",
			en: "this is long description of command"
		}, // Long description of command
		category: "categoryName", // Category of command
		guide: {
			vi: "đây là hướng dẫn sử dụng của lệnh",
			en: "this is guide of command"
		} // Guide of command
	},

	langs: {
		vi: {
			hello: "xin chào",
			helloWithName: "xin chào, id facebook của bạn là %1"
		}, // Vietnamese language
		en: {
			hello: "hello world",
			helloWithName: "hello, your facebook id is %1"
		} // English language
	},

	// onStart is a function that will be executed when the command is executed
	onStart: async function ({ api, args, message, event, threadsData, usersData, dashBoardData, globalData, threadModel, userModel, dashBoardModel, globalModel, role, commandName, getLang }) {
		// YOUR CODE HERE
    
              let questions = [
                {
                  question: "من يرسل ايموجي هاذا الوصف اولا يفوز:وجه مبتسم  ",
                  answer: "😃"
                },
                {
                  question: "من يرسل ايموجي هاذا الوصف اولا يفوز: رجل زو شعر ابيض",
                  answer: "👨‍🦳"
                },
                {
                  question: "من يرسل ايموجي هاذا الوصف اولا يفوز: رجل يرفع يدو",
                  answer: "🙋‍♂️"
                },
                {
                  question: "من يرسل ايموجي هاذا الوصف اولا يفوز:  لسان ",
                  answer: "👅"
                }, {
                  question: "من يرسل ايموجي هاذا الوصف اولا يفوز: قبعة",
                  answer: "🧢"
                }, {
                  question: "من يرسل ايموجي هاذا الوصف اولا يفوز: رجل زومبي ",
                  answer: "🧟‍♂️"
                }, {
                  question: "من يرسل ايموجي هاذا الوصف اولا يفوز: وجه غاضب",
                  answer: "😡"
                }, {
                  question: "من يرسل ايموجي هاذا الوصف اولا يفوز: وجه يضح بدموع",
                  answer: "😂"
                }, {
                  question: "من يرسل ايموجي هاذا الوصف اولا يفوز: وجه حزين",
                  answer: "😔"
                }, {
                  question: "من يرسل ايموجي هاذا الوصف اولا يفوز: رجل مبرمج",
                  answer: "👨‍💻"
                }, {
                  question: "من يرسل ايموجي هاذا الوصف اولا يفوز: رجل طباخ",
                  answer: "👨‍🍳"
                }, {
                  question: "من يرسل ايموجي هاذا الوصف اولا يفوز: شرطي",
                  answer: "👨‍✈️"
                }, {
                  question: "من يرسل ايموجي هاذا الوصف اولا يفوز: ايموجي في عينيه الحب",
                  answer: "😍"
                }, {
                  question: "من يرسل ايموجي هاذا الوصف اولا يفوز: يلقي تحية الشرطي",
                  answer: "🫡"
                },
              ];
              let randomIndex = Math.floor(Math.random() * questions.length);
              let randomQuestion = questions[randomIndex].question;
              let answer = questions[randomIndex].answer;
              api.sendMessage(randomQuestion, event.threadID, (err, messageInfo)=>{
                let stopListening = api.listenMqtt((err, event) => {
                if (err) return console.error(err);
api.setOptions({listenEvents: true});
                switch (event.type) {
                  case "message":
                    if(event.threadID === messageInfo.threadID){
                      if (event.body === answer) {               api.sendMessage("جميل انت سريع", event.threadID, event.messageID);
                      return listenEmitter.stopListening();
                    } else if (event.body === 'ايموجي') {
                      return listenEmitter.stopListening();
                    }
                    api.markAsRead(event.threadID, (err) => {
                      if (err) console.log(err);
                    });
                    }

                    break;
                }
              });
              });

	}
};