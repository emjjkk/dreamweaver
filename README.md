### This bot no longer works because of changes to pricing plans on the API provider.
Maybe I'll upgrade to pro in the future but for now this bot is dead.


## Dreamweaver: Near perfect AI images and artwork. Instantly. Open-source. On Discord.

Website: https://dreamweaverdiscord.vercel.app

Official Discord: https://discord.gg/xTQ4WRNqyJ


### Getting Started

- Copy the contents of .env.example into an .env.local file and fill out your Supabase, Discord, and Huggingface credentials there.

- Dreamweaver at it's core is a NextJS + Supabase app and can be run as such

```
git clone https://github.com/emjjkk/Dreamweaver.git
npm install
npm run dev
```

- Interactions endpoint `/api/interactions`

- Commands `/lib/discord/commands`

- Register commands `/scripts/register-commands.ts` (run independently) 

- AI generation logic `/lib/generate/**`


### Credits
**Bot Developers**: @emjjkk, @aiya2007

**Qwen-Image Model https://huggingface.co/Qwen/Qwen-Image** : Chenfei Wu, Jiahao Li, Jingren Zhou, Junyang Lin, Kaiyuan Gao, Kun Yan, Sheng-ming Yin, Shuai Bai, Xiao Xu, Yilei Chen, Yuxiang Chen, Zecheng Tang, Zekai Zhang, Zhengyi Wang, An Yang, Bowen Yu, Chen Cheng, Dayiheng Liu, Deqing Li, Hang Zhang, Hao Meng, Hu Wei, Jingyuan Ni, Kai Chen, Kuan Cao, Liang Peng, Lin Qu, Minggang Wu, Peng Wang, Shuting Yu, Tingkun Wen, Wensen Feng, Xiaoxiao Xu, Yi Wang, Yichang Zhang, Yongqiang Zhu, Yujia Wu, Yuxuan Cai, Zenan Liu
