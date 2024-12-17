module.exports.config = {
  name: "addthread",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "Ducky",
  description: "Thêm bạn vào nhóm mà bot đang ở",
  commandCategory: "ADMIN",
  usages: "addthread",
  cooldowns: 0,
  dependencies: {}
};

module.exports.handleReply = async function ({ event, api, handleReply }) {
  const { threadID, messageID, body, senderID } = event;
  const { threadList, author } = handleReply;

  if (author != senderID) {
    return api.sendMessage("Bạn không phải là người gửi yêu cầu.", threadID, messageID);
  }

  const choices = body.split(/,|\s+/).map(choice => parseInt(choice.trim()));
  const validChoices = choices.filter(choice => !isNaN(choice) && choice >= 1 && choice <= threadList.length);

  if (validChoices.length === 0) {
    return api.sendMessage("Lựa chọn của bạn không hợp lệ. Hãy reply với các số hợp lệ từ danh sách.", threadID, messageID);
  }

  for (const choice of validChoices) {
    const selectedThread = threadList[choice - 1];
    const { participantIDs } = selectedThread;

    if (participantIDs.includes(senderID)) {
      api.sendMessage(`Bạn đã có mặt trong nhóm "${selectedThread.name}".`, threadID);
      continue;
    }

    try {
      await api.addUserToGroup(senderID, selectedThread.threadID);
      api.sendMessage(`Đã thêm bạn vào nhóm "${selectedThread.name}".`, threadID);
    } catch (error) {
      api.sendMessage(`Đã xảy ra lỗi khi thêm vào nhóm "${selectedThread.name}": ${error.message}`, threadID);
    }
  }
};

module.exports.run = async function ({ api, event }) {
  const permission = global.config.NDH;
         if (!permission.includes(event.senderID)) return api.sendMessage("⚠️ Lệnh này chỉ có ADMIN chính được sử dụng.", event.threadID, event.messageID);	
  const { threadID, messageID, senderID } = event;

  try {
    const threadList = await api.getThreadList(50, null, ["INBOX"]);
    const activeGroups = threadList.filter(group => group.isSubscribed && group.isGroup);

    if (activeGroups.length === 0) {
      return api.sendMessage("Hiện tại không có nhóm nào hoạt động mà bot có thể thêm bạn vào.", threadID, messageID);
    }

    let message = "Danh sách các nhóm hiện có:\n";
    activeGroups.forEach((group, index) => {
      message += `${index + 1}. ${group.name}\n`;
    });

    message += "\n━━━━━━━━━━━━━━━━━━━━━━━━\nHãy reply với các số tương ứng có thể cách nhau bằng dấu phẩy hoặc dấu cách để tham gia nhóm nhiều nhóm một lúc.";

    api.sendMessage(message, threadID, (error, info) => {
      if (error) return api.sendMessage("Có lỗi xảy ra, vui lòng thử lại sau.", threadID, messageID);

      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        threadList: activeGroups
      });
    }, messageID);
  } catch (error) {
    api.sendMessage("Không thể lấy danh sách nhóm, vui lòng thử lại sau.", threadID, messageID);
  }
};