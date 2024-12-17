module.exports.config = {
	name: "send",
	commandCategory: "ADMIN",
	credits: "Mr.Ben",
	cooldowns: 20,
	hasPermssion: 2, 
	description: "Gửi thông báo cho tất cả nhóm trên bot"
};
const
	axios = require("axios"),
	fs = require("fs-extra"),
	time = (format) => require("moment-timezone").tz("Asia/Ho_Chi_minh").format(format),
	saveFile = async (path, url) => {
		let dataStream = (await axios.get(url, {responseType: "arraybuffer"})).data;
		return fs.writeFileSync(path, Buffer.from(dataStream, "utf-8"))
	}
module.exports.run = async function({ api, event, args, Users }) {
	try {
		const permission = global.config.ADMINBOT; //nếu muốn thêm uid thì thêm ,"uid" sau mỗi hàng
	       if (!permission.includes(event.senderID))
	 return api.sendMessage("Đã gửi✅", event.threadID, event.messageID); // get tn
const
			{ threadID, messageID, messageReply, senderID } = event,
			 allID  = global.data.allThreadID,
			{ threadName } = await api.getThreadInfo(threadID);
		var
			listSc = [], listErr = [];
		if (event.type == "message_reply") {
			if (messageReply.attachments.length != 0) {
				var allFile = [], c = 1, attachment = [];
				for (var i of messageReply.attachments) {
					var
						typeFile = i.type == "photo" ? ".png" : i.type == "audio" ? ".mp3" : i.type == "video" ? ".mp4" : ".gif",
						path = __dirname + "/cache/sendNoti" + (c++) + typeFile;
						await saveFile(path, i.url);
					allFile.push(path);
					attachment.push(fs.createReadStream(path))
				};
				let msg = {};
				msg.body = `[ Notice From ${await Users.getNameUser(senderID)}]\n[👤] - Gửi từ: ${threadID == senderID ? "Tin nhắn riêng" : threadName}\n[💬] - Nội dung: ${args.length == 0 ? "Không có nội dung" : args.join(" ")}\n[⏰️] - Vào lúc: ${time("DD/MM/YYYY")} - ${time("HH:mm:ss")}\n[💡] - Trả lời tin nhắn này để nhắn lại cho ADMIN`;
				msg.attachment = attachment;
				await new Promise(resolve => {
					
					allID.forEach(i => {
						try {
					if (i != threadID) {
						api.sendMessage(msg, i, (err, info) => {
							if (err) return listErr.push(err);
							global.client.handleReply.push({
								name: this.config.name,
								messageID: info.messageID,
								Reply: messageID,
								threadID,
								type: "Send"
							})
						});
						listSc.push(i)
					}
						}catch (e) { console.log(e)}
					})
				})
			}
			else return api.sendMessage("[ SendNoti ] - vui lòng chỉ reply: ảnh, video, gif, music", threadID, messageID);
		}
		else {
			var msg = {};
			msg.body = `[ Notice From ${await Users.getNameUser(senderID)}]\n[👤] - Gửi từ: ${threadID == senderID ? "Tin nhắn riêng" : threadName}\n[💬] - Nội dung: ${args.length == 0 ? "Không có nội dung" : args.join(" ")}\n[⏰️] - Vào lúc: ${time("DD/MM/YYYY")} - ${time("HH:mm:ss")}\n[💡] - Trả lời tin nhắn này để nhắn lại cho ADMIN`;
			await new Promise (resolve => {
				allID.forEach(i => {
				if (i != threadID) {
					try {
						api.sendMessage(msg, i, (err, info) => {
						if (err) return listErr.push(i)
						global.client.handleReply.push({
							name: this.config.name,
							messageID: info.messageID,
							threadID,
							Reply: messageID,
							type: "Send"
						});
					})
						listSc.push(i)
					} catch (e) {console.log(e)}
				}
				}) 
			})
		}
		return api.sendMessage(`[ SendNoti ] - Đã gửi thành công cho ${listSc.length} nhóm, và không thành công cho ${listErr.length} nhóm`, threadID, () => allFile?.forEach(i => fs.unlinkSync(i)), messageID)
	} catch (error) {
		console.log(error)
	}
};
module.exports.handleReply = async function({ api, event, handleReply: H, Users }) {
	try {
		const
			{ threadID, messageID, senderID, attachments, args } = event,
			{ threadName } = await api.getThreadInfo(threadID);
		if (H.type == "Send") {
			if (attachments.length != 0) {
				var allFile = [], c = 1, attachment = [];
				for (var i of attachments) {
					var
						typeFile = i.type == "photo" ? ".png" : i.type == "audio" ? ".mp3" : i.type == "video" ? ".mp4" : i.type == 'sticker' ? '.jpg' : i.type == 'share' ? '.jpg' : ".gif",
						path = __dirname + "/cache/sendNoti" + (c++) + typeFile,
						url = (await axios.get(i?.image || i?.url, { responseType: "arraybuffer" })).data;
					fs.writeFileSync(path, Buffer.from(url, "utf-8"))
					allFile.push(path);
					attachment.push(fs.createReadStream(path))
				};
				var msg = {};
				msg.body = `[ Reply From User ${await Users.getNameUser(senderID)}]\n[👤] - Gửi từ: ${threadID == senderID ? "Tin nhắn riêng" : threadName}\n[💬] - Nội dung: ${args.length == 0 ? "Không có nội dung" : args.join(" ")}\n[⏰️] - Vào lúc: ${time("DD/MM/YYYY")} - ${time("HH:mm:ss")}\n[💡] - Trả lời tin nhắn này để nhắn lại cho Người dùng`;
				msg.attachment = attachment;
				return api.sendMessage(msg, H.threadID, (err, info) => {
					global.client.handleReply.push({
						name: this.config.name,
						messageID: info.messageID,
						threadID,
						Reply: messageID,
						type: "UserReply"
					});
					allFile.forEach(i => fs.unlinkSync(i))
				}, H.Reply)
			}
			else {
				var msg = {};
				msg.body = `[ Reply From User ${await Users.getNameUser(senderID)}]\n[👤] - Gửi từ: ${threadID == senderID ? "Tin nhắn riêng" : threadName}\n[💬] - Nội dung: ${args.length == 0 ? "Không có nội dung" : args.join(" ")}\n[⏰️] - Vào lúc: ${time("DD/MM/YYYY")} - ${time("HH:mm:ss")}\n[💡] - Trả lời tin nhắn này để nhắn lại cho Người dùng`;
				return api.sendMessage(msg, H.threadID, (err, info) => {
					global.client.handleReply.push({
						name: this.config.name,
						messageID: info.messageID,
						threadID,
						Reply: messageID,
						type: "UserReply"
					})
				}, H.Reply)
			}
		}
		else {
			if (attachments.length != 0) {
				var allFile = [], c = 1, attachment = [];
				for (var i of attachments) {
					var
						typeFile = i.type == "photo" ? ".png" : i.type == "audio" ? ".mp3" : i.type == "video" ? ".mp4" : i.type == 'sticker' ? '.jpg' : i.type == 'share' ? '.jpg' : ".gif",
						path = __dirname + "/cache/sendNoti" + (c++) + typeFile,
						url = (await axios.get(i?.image || i?.url, { responseType: "arraybuffer" })).data;
					fs.writeFileSync(path, Buffer.from(url, "utf-8"))
					allFile.push(path);
					attachment.push(fs.createReadStream(path))
				};
				var msg = {};
				msg.body = `[ Reply From ADMIN ${await Users.getNameUser(senderID)}]\n[👤] - Gửi từ: ${threadID == senderID ? "Tin nhắn riêng" : threadName}\n[💬] - Nội dung: ${args.length == 0 ? "Không có nội dung" : args.join(" ")}\n[⏰️] - Vào lúc: ${time("DD/MM/YYYY")} - ${time("HH:mm:ss")}\n[💡] - Trả lời tin nhắn này để nhắn lại cho Người ADMIN`;
				msg.attachment = attachment;
				return api.sendMessage(msg, H.threadID, (err, info) => {
					global.client.handleReply.push({
						name: this.config.name,
						messageID: info.messageID,
						threadID,
						Reply: messageID,
						type: "Send"
					})
					allFile.forEach(i => fs.unlinkSync(i))
				}, H.Reply)
			}
			else {
				var msg = {};
				msg.body = `[ Reply From ADMIN ${await Users.getNameUser(senderID)}]\n[👤] - Gửi từ: ${threadID == senderID ? "Tin nhắn riêng" : threadName}\n[💬] - Nội dung: ${args.length == 0 ? "Không có nội dung" : args.join(" ")}\n[⏰️] - Vào lúc: ${time("DD/MM/YYYY")} - ${time("HH:mm:ss")}\n[💡] - Trả lời tin nhắn này để nhắn lại cho ADMIN `;
				return api.sendMessage(msg, H.threadID, (err, info) => {
					global.client.handleReply.push({
						name: this.config.name,
						messageID: info.messageID,
						threadID,
						Reply: messageID,
						type: "Send"
					})
				}, H.Reply)
			}
		}
	} catch (error) {
		console.log(error)
	}
}