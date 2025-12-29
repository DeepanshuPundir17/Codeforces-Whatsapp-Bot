
# CodeForces WhatsApp Bot 🤖

A WhatsApp bot built using whatsapp-web.js that helps competitive programmers track their Codeforces progress — directly inside group chats.

This bot lets users register their Codeforces handles and instantly fetch useful details like ratings, contest performance, and upcoming contests. Perfect for coding clubs, college groups, or competitive programming communities.💬

To chat with the bot click [here](https://wa.me/919068666560?text=/help)

## Features 🚀

✅ Get contest performance of all users present in the group. 📊

✅ Users can be added or removed from the group. ➕ 

✅ Get a list and ratings of all users present in the group. 📋

✅ Get details of upcoming contests. 🗓

## Available Commands 💻

This bot provides the following commands: 📢

- `/help or /start`: Displays the help message including details and use of each command.
- `/contest`: Sends a list of upcoming CodeForces contests.
- `/add user_handle`: Adds CodeForces handles to the list.
- `/delete user_handle`: Removes CodeForces handles from the list.
- `/perf CONTEST_ID`: Sends the performance of all users in the specified contest.
- `/ratings`: Sends the ratings of all users in the group.
- `/check`: Deletes the invalid handles and update handle of user in database automatically if it has been changed. 

Feel free to customize or enhance the bot as per your requirements! 🔧

## Installation 💻

To install the required dependencies, run the following command:

```sh
npm install whatsapp-web.js qrcode-terminal
npm install axios
npm install lowdb@1
npm install puppeteer 
```


## Getting Started 🚀
1. Clone this repository.
2. Install the dependencies mentioned above.
3. Run the bot using the following command:

```sh
node wabot.js
```

Now, you will be asked to scan a QR code from the whatsapp number which you would like to make your BOT,if you don't have any you can use bot [here](https://wa.me/919068666560?text=/help) directly.You may also add this bot number to groups to compete with your peeps.

## Acknowledgements

This project wouldn't have been possible without the invaluable contribution of the `whatsapp-web.js` library. I would like to express my sincere gratitude to the developers of `whatsapp-web.js` for providing a powerful and reliable library for building WhatsApp bots.

Special thanks to the team behind `whatsapp-web.js` for their continuous efforts in maintaining and improving the library, as well as the open-source community for their support and contributions.

Repository Link: [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)

## License

This project is licensed under the [MIT License](LICENSE).


## Closing Remarks

Thank you for checking out this WhatsApp Bot repository! I hope you find it useful and informative. Feel free to explore the code, customize it according to your needs, and contribute to its development.

If you have any questions, suggestions, or issues, please don't hesitate to open an issue or submit a pull request. Your feedback and contributions are greatly appreciated.

Happy coding and enjoy using the WhatsApp Bot! 🚀
