module.exports.config = {
    name: 'unsend',
    version: '1.1.1',
    hasPermssion: 0,
    credits: 'DC-Nam & BoK',
    description: 'Bật/tắt thả cảm xúc gỡ tin nhắn',
    commandCategory: 'Reaction',
    cooldowns: 3
};
const {
    readFileSync,
    writeFileSync,
    existsSync
} = require('fs-extra');
const path = () => __dirname + '/cache/unsendMessage.json';
const saved = (a, b) => writeFileSync(a, JSON.stringify(b, null, 4));
module.exports.onLoad = function() {
    if (!existsSync(path())) writeFileSync(path(), '{}');
};
module.exports.run = function({
    api, event
}) {
    const {
        sendMessage: send,
    } = api;
    const {
        threadID: tid,
        messageID: mid,
        args
    } = event;
    const data = JSON.parse(readFileSync(path()));
    if (!data[tid]) data[tid] = {};
    if (!!args[1]) {
        if (/([\w])|([\s])/.test(args[1])) return; // còn ktdb hmm... thôi để tạm vậy đã :))
        data[tid].icon = args[1],
        saved(path(), data);
        send(`Đã thiết lập icon reaction unsend là ${args[1]}`, tid, mid);
    } else {
        if (data[tid].icon == undefined) return send(`Bạn chưa thiết lập icon`, tid, mid); else {
            data[tid].status = !data[tid].status ? true: false;
            saved(path(), data);
            send(`${data[tid].status ? 'bật': 'tắt'} reaction unsend`, tid, mid);
        };
    }
};
module.exports.reaction = function(a, b) {
    const data = JSON.parse(readFileSync(path()));
     if (b.senderID == a.getCurrentUserID() && data[b.threadID].status && b.reaction == data[b.threadID].icon) return a.unsendMessage(b.messageID);
};