

module.exports = {
	config: {
		name: "القفل",
		version: "1.0",
		author: "NIB",
		countDown: 1,
		role: 0,
		shortDescription: "Enable/disable antiout",
		longDescription: "",
		category: "boxcontrol",
		guide: "القفل تشغيل القفل ايقاف",
		envConfig: {
			deltaNext: 5
		}
	},
  

	onStart: async function ({ message, event, threadsData, args }) {
let antiout = await threadsData.get(event.threadID, "settings.antiOut");
		
			
    if(antiout === undefined){
      await threadsData.set(event.threadID, true, "settings.antiOut");
    }
    console.log(await threadsData.get(event.threadID, "settings.reSend"))
		if (!["تشغيل", "ايقاف"].includes(args[0]))
			return message.reply("تشغيل or ايقاف")
		await threadsData.set(event.threadID, args[0] === "تشغيل ", "settings.antiOut");
    
		return message.reply(`Is already ${args[0] === "تشغيل " ? "turn on" : "Turn off"}`);
	}



  
}
