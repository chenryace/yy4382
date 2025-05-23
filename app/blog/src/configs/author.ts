export const authorName = "Yunfi";
export const authorDescription = "Undergraduate";

export const contactInfo: {
  name: string;
  icon: string;
  link: string;
  color: string;
}[] = [
  {
    name: "GitHub",
    icon: "mingcute:github-line",
    link: "https://github.com/yy4382",
    color: "#000000",
  },
  {
    name: "Telegram",
    icon: "mingcute:telegram-line",
    link: "https://t.me/yunfichannel",
    color: "#24A1DE",
  },
  {
    name: "Twitter",
    icon: "mingcute:twitter-line",
    link: "https://twitter.com/yunfini",
    color: "#1DA1F2",
  },
  {
    name: "Email",
    icon: "mingcute:mail-send-line",
    link: "mailto:i@yfi.moe",
    color: "#f87171",
  },
];

export const projects = [
  {
    // filename.svg in /src/icons folder
    icon: "s3-image-port",
    title: "S3 Image Port",
    desc: "将 S3 作为图床",
    links: [
      {
        href: "https://github.com/yy4382/s3-image-port",
        text: "GitHub",
        icon: "mingcute:github-line",
      },
      {
        href: "https://iport.yfi.moe",
        text: "Web App",
        icon: "mingcute:compass-3-line",
      },
    ],
  },
  {
    icon: "tts-import",
    title: "TTS Importer",
    desc: "轻松将 Azure TTS 导入阅读软件",
    links: [
      {
        href: "https://github.com/yy4382/tts-importer",
        text: "GitHub",
        icon: "mingcute:github-line",
      },
      {
        href: "https://tts.yfi.moe",
        text: "Web App",
        icon: "mingcute:compass-3-line",
      },
    ],
  },
  {
    icon: "ob-export",
    title: "Obsidian Site Exporter",
    desc: "将 Obsidian 笔记导出为通用 Markdown 文件",
    links: [
      {
        href: "https://github.com/yy4382/obsidian-static-site-export",
        text: "GitHub",
        icon: "mingcute:github-line",
      },
    ],
  },
];
