const fs = require('fs');
const axios = require('axios');

module.exports.config = {
  name: "read",
  version: "1.0.0",
  hasPermission: 2,
  credits: "Eien Mojiki",
  description: "Reads the contents of a JavaScript file in the commands folder.",
  commandCategory: "Tiện Ích",
  usages: "read -f {filename}.js | read -a {url} | read -j {api-url} | read -st {url}",
  cooldowns: 5
};

module.exports.run = async function({ args, event, api }) {
  const option = args[0];
  switch (option) {
    case 'file':
    case `-f`: {
      const filename = args[1];
      if (!filename) {
        return api.sendMessage("Vui Lòng Nhập Tên Modules", event.threadID);
      }

      const path = `./modules/commands/${filename}`;
      if (!fs.existsSync(path)) {
        return api.sendMessage(`File '${filename}' Không Tồn Tại`, event.threadID);
      }

      const content = fs.readFileSync(path, 'utf8');
      return api.sendMessage(content, event.threadID);
    }
    case '-a': {
      const url = args[1];
      try {
        const response = await axios.get(url);
        const content = response.data;
        return api.sendMessage(content, event.threadID);
      } catch (error) {
        return api.sendMessage(`Lỗi ${url}\n ${error}`, event.threadID);
      }
    }
    case 'json':
    case `-j`: {
      const apiUrl = args[1];
      try {
        const response = await axios.get(apiUrl);
        const content = JSON.stringify(response.data, null, 2);
        return api.sendMessage(content, event.threadID);
      } catch (error) {
        return api.sendMessage(`Lỗi ${apiUrl}\n ${error}`, event.threadID);
      }
    }
      case '-st':
      case `stream`: {
      const sturl = args[1];
      try {
        return api.sendMessage({
          body: 'Stream file thành công!',
          attachment: (await axios.get(sturl, { responseType: "stream" })).data
        }, event.threadID, event.messageID);
      } catch (error) {
        return api.sendMessage(`Lỗi ${error}`, event.threadID, event.messageID);
      }
    }
      case '-x':
      case 'xem': {
      const urll = args[1];
  try {
      const { get } = require('axios');
      const { image } = require('image-downloader');
      const { createReadStream }  = require('fs-extra');
      const content = (event.type == "message_reply") ? event.messageReply.body : args.join(" ");

      const dest = `${__dirname}/cache/12abc.png`;
      await image({
        url: content, dest
      });
      return api.sendMessage({
        body: `Ảnh của bạn nè`, attachment: createReadStream(dest)
      }, event.threadID, event.messageID);
     } catch (error) {
        return api.sendMessage(`Lỗi ${error}`, event.threadID);
      }
}
    default: {
      return api.sendMessage(`Tùy Chọn Không Hợp Lệ ${option}\nVui Lòng Sử Dụng Các Tuỳ Chọn Sau : \n → ${global.config.PREFIX}read file Để Đọc Tệp Trong File\n → ${global.config.PREFIX}read -a Đọc Dữ Liệu Từ URL \n → ${global.config.PREFIX}read json Đọc Dữ Liệu JSON Từ API\n → ${global.config.PREFIX}read -st Để Xem Ảnh , Video , Gif , Âm Thanh Từ URL`, event.threadID);
    }
  }
};