const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');


//LOWDB SETUP
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('bot_data.json');
const db = low(adapter);

db.defaults({ users: [] }).write();

const CF_API = "https://codeforces.com/api/";

const client = new Client({
    authStrategy: new LocalAuth(), 
    puppeteer: {
        executablePath: '/data/data/com.termux/files/usr/bin/chromium-browser', 
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('Scan this QR code with your dedicated WhatsApp number:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => console.log('✅ Codeforces WhatsApp Bot is Online!'));

function formatHandle(handle, width) {
    if (handle.length > width) {
        return handle.substring(0, width - 2) + "..";
    }
    return handle.padEnd(width, ' ');
}

function getRankEmoji(rating) {
    if (rating === 'Unrated' || rating < 1200) return "⚪"; 
    if (rating < 1400) return "🟢"; 
    if (rating < 1600) return "🟡"; 
    if (rating < 1900) return "🔵"; 
    if (rating < 2100) return "🟣"; 
    if (rating < 2400) return "🟠"; 
    return "🔴"; 
}

// COMMANDS
client.on('message', async (msg) => {
    const chat = await msg.getChat();
    const chatId = chat.id._serialized;
    const body = msg.body.trim();
    const parts = body.split(' ');
    const command = parts[0].toLowerCase();

    // 1. /help or /start
    if (command === '/start' || command === '/help') {
        const helpText = 
            "*🤖 Codeforces Bot Help*\n\n" +
            "*Commands:*\n" +
            "• `/add [handle]` - Add user to this group.\n" +
            "• `/delete [handle]` - Remove user.\n" +
            "• `/ratings` - View leaderboard.\n" +
            "• `/perf [contest_id]` - Contest ranks.\n" +
            "• `/contest` - Upcoming contests.";
        msg.reply(helpText);
    }

    // 2. /add [handle]
    if (command === '/add') {
        const handle = parts[1];
        if (!handle) return msg.reply("Usage: `/add [handle]`");

        try {
            const verifyRes = await axios.get(`${CF_API}user.info?handles=${handle}`);
            if (verifyRes.data.status !== 'OK') throw new Error();

            const existing = db.get('users').find({ chat_id: chatId, handle: handle }).value();
            if (existing) return msg.reply(`ℹ️ *${handle}* is already in list.`);

            db.get('users').push({ chat_id: chatId, handle: handle }).write();
            msg.reply(`✅ Verified and added *${handle}*!`);
        } catch (e) {
            msg.reply(`❌ *Handle Not Found:* The username \`${handle}\` does not exist.`);
        }
    }

    // 3. /delete [handle]
    if (command === '/delete') {
        const handle = parts[1];
        if (!handle) return msg.reply("Usage: `/delete [handle]`");

        const removed = db.get('users').remove({ chat_id: chatId, handle: handle }).write();
        if (removed.length > 0) msg.reply(`✅ Removed *${handle}*.`);
        else msg.reply(`❌ User *${handle}* was not found.`);
    }

    // 4. /ratings
    if (command === '/ratings') {
        const rows = db.get('users').filter({ chat_id: chatId }).value();
        if (!rows || rows.length === 0) return msg.reply("No users found.");

        const handles = rows.map(r => r.handle).join(';');
        try {
            const res = await axios.get(`${CF_API}user.info?handles=${handles}`);
            const sortedUsers = res.data.result.sort((a, b) => (b.rating || 0) - (a.rating || 0));

            let response = "```\n"; 
            response += "   Handle        | Ratings\n";
            response += "=============================\n";

            sortedUsers.forEach(u => {
                const rating = (u.rating || 0).toString();
                const bullet = getRankEmoji(u.rating || 0);
                const formattedName = formatHandle(u.handle, 15);
                const paddedRating = rating.padStart(5, ' ');
                response += `${bullet} ${formattedName} | ${paddedRating}\n`;
            });
            response += "```";
            client.sendMessage(chatId, response);
        } catch (e) { msg.reply("⚠️ API Error."); }
    }

    // 5. /perf [contest_id]
    if (command === '/perf') {
        const contestId = parts[1];
        if (!contestId) return msg.reply("Usage: `/perf [contest_id]`");

        const rows = db.get('users').filter({ chat_id: chatId }).value();
        if (!rows || rows.length === 0) return msg.reply("No users registered.");
        
        const handles = rows.map(r => r.handle).join(';');
        
        try {
            const res = await axios.get(`${CF_API}contest.standings?contestId=${contestId}&handles=${handles}&showUnofficial=true`);
            const validResults = res.data.result.rows
                .filter(r => r.rank > 0) 
                .sort((a, b) => a.rank - b.rank);

            let response = `*Standings: ${res.data.result.contest.name}*\n`;
            response += "```\n";
            response += "      Handle       Solved Rank\n";
            response += "============================\n";

            if (validResults.length === 0) {
                response += "No participants found.";
            } else {
                const infoRes = await axios.get(`${CF_API}user.info?handles=${handles}`);
                const userMap = {};
                infoRes.data.result.forEach(u => { userMap[u.handle] = u.rating || 0; });

                validResults.forEach(r => {
                    const handle = r.party.members[0].handle;
                    const solved = r.problemResults.filter(p => p.points > 0).length;
                    const rank = r.rank.toString();
                    const bullet = getRankEmoji(userMap[handle] || 0);
                    const formattedName = formatHandle(handle, 16);
                    const paddedSolved = solved.toString().padStart(2, ' ');
                    const paddedRank = rank.padStart(5, ' ');
                    response += `${bullet} ${formattedName} |${paddedSolved}| ${paddedRank}\n`;
                });
            }

            response += "```";
            msg.reply(response);
        } catch (e) { msg.reply("❌ API/Contest Error."); }
    }

    // 6. /contest
    if (command === '/contest') {
        try {
            const res = await axios.get(`${CF_API}contest.list`);
            const upcoming = res.data.result
                .filter(c => c.phase === 'BEFORE')
                .reverse() 
                .slice(0, 5);
            
            let response = "*🗓 Upcoming Codeforces Contests:*\n";
            
            upcoming.forEach(c => {
                const dateObj = new Date(c.startTimeSeconds * 1000);
                const options = { timeZone: 'Asia/Kolkata' };
                const day = dateObj.toLocaleString('en-GB', { ...options, day: '2-digit' });
                const month = dateObj.toLocaleString('en-GB', { ...options, month: 'short' });
                const year = dateObj.toLocaleString('en-GB', { ...options, year: 'numeric' });
                const formattedDate = `${day} ${month} ${year}`;
                const timeStr = dateObj.toLocaleString('en-GB', {
                    ...options,
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
                
                const formattedTime = `${timeStr} IST`.toLowerCase();
                response += `\n*${c.name}*\n`;
                response += `📅 Date: \`${formattedDate}\`\n`;
                response += `⏰ Time: \`${formattedTime}\`\n`;
                response += `🆔 ID: \`${c.id}\`\n`;
            });

            msg.reply(response);
        } catch (e) { 
            console.error(e);
            msg.reply("⚠️ API Error while fetching contests."); 
        }
    }

    // 7. /check 
    if (command === '/check') {
        const rows = db.get('users').filter({ chat_id: chatId }).value();
        if (!rows || rows.length === 0) return msg.reply("No users registered to check.");

        msg.reply(`🔍 Analyzing ${rows.length} handles and removing duplicates...`);

        let updateCount = 0;
        let duplicateCount = 0;
        let changeLogs = [];
        let seenHandles = new Set();

        for (const user of rows) {
            const lowerHandle = user.handle.toLowerCase();
            if (seenHandles.has(lowerHandle)) {
                db.get('users').remove({ chat_id: chatId, handle: user.handle }).write();
                duplicateCount++;
                continue; 
            }
            seenHandles.add(lowerHandle);

            try {
                const res = await axios.get(`${CF_API}user.info?handles=${user.handle}`);
                if (res.data.status === 'OK') {
                    const currentHandle = res.data.result[0].handle;
                    if (user.handle.toLowerCase() !== currentHandle.toLowerCase()) {
                        db.get('users')
                          .find({ chat_id: chatId, handle: user.handle })
                          .assign({ handle: currentHandle })
                          .write();
                        changeLogs.push(`✅ Updated: *${user.handle}* → *${currentHandle}*`);
                        updateCount++;
                    }
                }
            } catch (e) {
                if (e.response && e.response.status === 400) {
                    db.get('users').remove({ chat_id: chatId, handle: user.handle }).write();
                    changeLogs.push(`❌ Removed: *${user.handle}*`);
                    updateCount++;
                }
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        let report = `📊 *Check Result:*\n`;
        if (duplicateCount > 0) report += `• Duplicates Removed: ${duplicateCount}\n`;
        if (updateCount > 0) report += `• Handles Updated: ${updateCount}\n\n`;
        if (changeLogs.length > 0) {
            report += changeLogs.join('\n');
        } else if (duplicateCount === 0) {
            report = "✅ No duplicates or name changes found.";
        } else {
            report += "\n✅ All remaining handles are valid.";
        }
        msg.reply(report);
    }
});
client.initialize();