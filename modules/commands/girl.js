const fs = require("fs");
const path = require("path");
const axios = require("axios");
async function streamURL(url, type) {
    try {
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream'
        });
        const filePath = path.resolve(__dirname, `config/${Date.now()}.${type}`);
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        return fs.createReadStream(filePath);
    } catch (error) {
        console.error("Không thể tải xuống dữ liệu từ URL:", error);
        throw new Error("Không thể tải xuống dữ liệu từ URL.");
    }
}

module.exports.config = {
    name: "girl",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Ducky",
    description: "Gửi video gái xinh",
    commandCategory: "random-video",
    usages: "girl",
    cooldowns: 5,
};

module.exports.run = async ({ api, event }) => {
    if (isCommand) {
        // Đọc dữ liệu từ tệp JSON
        const dataPath = path.resolve(__dirname, "dataa/girl.json");
        let urls;
        try {
            urls = JSON.parse(fs.readFileSync(dataPath, "utf8"));
        } catch (error) {
            return api.sendMessage("Không thể đọc dữ liệu từ tệp JSON.", event.threadID);
        }

        // Chọn ngẫu nhiên một URL từ tập hợp
        const randomVideoUrl = urls[Math.floor(Math.random() * urls.length)];

        // Stream video từ URL và gửi như một phần đính kèm
        try {
            const attachment = await streamURL(randomVideoUrl, "mp4");
            api.sendMessage({
                body: "Đây là video gái xinh của bạn!",
                attachment
            }, event.threadID);
        } catch (err) {
            console.error("Không thể lấy dữ liệu từ URL:", err);
            api.sendMessage("Không thể gửi video. Vui lòng thử lại sau.", event.threadID);
        }
    }
};