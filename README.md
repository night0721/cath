# cath
A powerful [npm](https://nodejs.org) package that can easily interact and get data from NYX API.

[![Version](https://img.shields.io/github/package-json/v/night0721/cath?style=for-the-badge&color=555555&labelColor=02023a)]()
[![Download](https://img.shields.io/npm/dt/cath?style=for-the-badge&color=02023a)]()
[![Kofi](https://img.shields.io/static/v1?label=Support%20Us&message=KO.FI&color=ff5e5b&logo=kofi&logoColor=white&style=for-the-badge&scale=1.4)]()

# Usage
```js
const cath = require("cath");
const redditdata = await cath.getreddit("meme");
console.log(redditdata); // A random post from r/meme

const answer = await cath.random8ball();
console.log(answer); // A random answer from 8ball
```

# Installation
## npm
```sh
npm install cath
```

## yarn
```sh
yarn add cath
```
# Support
Join the official [Support Server](https://discord.gg/SbQHChmGcp) on Discord for help or feature requests.

# Contributions
Contributions are welcomed, feel free to open a pull request.

# License
This project is licensed under the GNU Public License v3.0. See [LICENSE](https://github.com/night0721/cath/blob/master/LICENSE) for more information.