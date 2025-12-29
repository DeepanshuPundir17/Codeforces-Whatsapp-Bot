Codeforces WhatsApp Bot

A WhatsApp bot built using whatsapp-web.js that helps competitive programmers track their Codeforces progress — directly inside group chats.

This bot lets users register their Codeforces handles and instantly fetch useful details like ratings, contest performance, and upcoming contests. Perfect for coding clubs, college groups, or competitive programming communities.

⭐ Features

➕ Add / remove Codeforces handles per WhatsApp group

📊 Leaderboard view based on live Codeforces ratings

🏁 Contest performance tracking for registered users

🗓 Upcoming contest reminders (time shown in IST)

🔎 Smart /check command

detects duplicate handles

fixes capitalization/name changes

removes invalid / deleted users automatically

🛠 Tech Stack

Node.js

whatsapp-web.js

Axios (Codeforces API)

LowDB (JSON-based storage)

QR authentication via WhatsApp Web

🚀 Commands
/start or /help   – Show help menu
/add [handle]     – Add user to group list
/delete [handle]  – Remove user
/ratings          – Show leaderboard
/perf [contestID] – Contest ranks for group members
/contest          – Upcoming Codeforces contests
/check            – Clean, verify & auto-update handles
