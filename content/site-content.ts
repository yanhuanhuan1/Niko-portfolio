// Edit the `zh` fields first.
// The `en` field is optional. If you leave it out, English mode falls back to `zh`.
// When you want a proper English rewrite, ask me and I will sync the translations.
// Photos and project images can be added or removed by editing the arrays in the sections below.

export type Language = "zh" | "en";

export type LocalizedText = {
  zh: string;
  en?: string | undefined;
};

export type LocalizedImage = {
  src: string;
  alt: LocalizedText;
};

export type IconKey =
  | "compass"
  | "sparkles"
  | "workflow"
  | "bot"
  | "layers"
  | "chart"
  | "wand";

export const t = (value: LocalizedText, language: Language): string =>
  language === "en" ? (value.en ?? value.zh) : value.zh;

export const localize = (zh: string, en?: string): LocalizedText => ({
  zh,
  en,
});

export const siteContent = {
  brand: {
    name: {
      zh: "Niko 作品集",
      en: "Niko Portfolio",
    },
    description: {
      zh: "一个默认中文显示的作品集框架，保留 rbp 结构并将内容整理为更安静的系统案例。",
      en: "A portfolio framework that displays Chinese by default, preserves the rbp structure, and organizes the content into quieter system case studies.",
    },
    creator: "@niko",
    author: "Niko",
    url: "https://example.com",
    ogImage: "/og-image.png",
    keywords: [
      "作品集",
      "系统案例",
      "中文网站",
      "portfolio",
      "Next.js",
      "React",
      "Tailwind CSS",
      "TypeScript",
    ],
  },
  nav: [
    {
      href: "/",
      label: { zh: "首页", en: "Home" },
    },
    {
      href: "/projects",
      label: { zh: "项目", en: "Projects" },
    },
    {
      href: "/about",
      label: { zh: "关于", en: "About" },
    },
  ],
  metadata: {
    home: {
      title: { zh: "首页", en: "Home" },
      description: {
        zh: "欢迎来到 Niko 作品集。这里以中文为默认，保留 rbp 的结构和节奏。",
        en: "Welcome to Niko Portfolio. Chinese is the default here, with the rbp structure and rhythm preserved.",
      },
    },
    about: {
      title: { zh: "关于", en: "About" },
      description: {
        zh: "一个已清空个人资料、保留留白结构的关于页。",
        en: "An about page that keeps the blank structure after personal details have been cleared.",
      },
    },
    projects: {
      title: { zh: "项目", en: "Projects" },
      description: {
        zh: "项目总览入口，点击卡片后会打开对应的外部作品链接。",
        en: "A project index that opens each card's external project link.",
      },
    },
  },
  hero: {
    kicker: {
      zh: "你好，这里是",
      en: "Hello, this is",
    },
    title: {
      zh: "Niko Zhou",
      en: "Niko Zhou",
    },
    description: {
      zh: "我专注于设计系统、信息架构与可视化表达，帮助产品与空间更高效、更一致地落地。",
      en: "I focus on design systems, information architecture, and visual communication, helping products and spaces land more efficiently and consistently.",
    },
    cta: {
      zh: "查看项目",
      en: "View projects",
    },
    panel: {
      // Put your two hero photos here. Replace the image paths with your own files when ready.
      photos: [
        {
          src: "/photo1.png",
          alt: {
            zh: "首页右侧头像照片一",
            en: "Homepage right panel portrait one",
          },
        },
        {
          src: "/photo2.png",
          alt: {
            zh: "首页右侧头像照片二",
            en: "Homepage right panel portrait two",
          },
        },
      ],
    },
  },
  homeProjects: {
    heading: {
      zh: "精选项目",
      en: "Selected projects",
    },
    description: {
      zh: "从空间概念到落地方案，这里记录着我最想呈现的几组设计与视觉表达",
      en: "From spatial concepts to implemented proposals, this section records the design and visual work I most want to present.",
    },
    viewAll: {
      zh: "查看全部项目",
      en: "View all projects",
    },
    missingLinkLabel: {
      zh: "ProcessOn 链接待添加",
      en: "ProcessOn link pending",
    },
    items: [
      {
        id: "loom",
        icon: "sparkles",
        iconLabel: localize("方案设计", "Proposal Design"),
        title: localize("上海外滩 · 海军节", "Shanghai Bund · Navy Festival"),
        description: localize(
          "参与策划项目, 负责方案、空间效果、道具设计, 协助有关部门沟通。",
          "Participated in the planning project, responsible for proposal design, spatial visuals, and prop design, and supported communication with relevant departments."
        ),
        meta: localize("策展方案设计,2025", "Curatorial proposal design, 2025"),
        externalUrl:
          "https://www.processon.io/embed/6a39f9e751bbd3339a8c9437?lang=en-US",
        imageRatio: 752 / 497,
        image: {
          src: "/海军节1.png",
          alt: localize(
            "Loom AI 写作伙伴界面",
            "Shanghai Bund Navy Festival project image"
          ),
        },
      },
      {
        id: "atlas",
        icon: "compass",
        iconLabel: localize("展厅设计", "Exhibition Design"),
        title: localize("US · LA 品牌方展厅", "US · LA Brand Exhibition Hall"),
        description: localize(
          "参与品牌展厅平面与方案设计，深化各立面并输出整体模型与效果。",
          "Participated in the brand exhibition hall plan and proposal design, refined each elevation, and produced the overall model and visual outputs."
        ),
        meta: localize(
          "展厅设计, 2026 in Pacific Palisades Village",
          "Exhibition design, 2026 in Pacific Palisades Village"
        ),
        externalUrl:
          "https://www.processon.io/embed/6a39e99651bbd3339a8c8d7a?cid=6a39e99651bbd3339a8c8d7b&lang=en-US",
        imageRatio: 1024 / 768,
        image: {
          src: "/back.png",
          alt: localize(
            "Atlas Studio 品牌与产品冲刺示意",
            "US LA brand exhibition hall project image"
          ),
        },
      },
      {
        id: "rhythm",
        icon: "chart",
        iconLabel: localize("展厅设计", "Exhibition Design"),
        title: localize("上海 · 鲁迅纪念馆", "Shanghai · Lu Xun Memorial Hall"),
        description: localize(
          "在部门协作中, 独立完成上海鲁迅纪念馆400㎡引玉厅方案与效果设计。",
          "Within departmental collaboration, independently completed the proposal and visual design for the 400㎡ Yinyu Hall at the Shanghai Lu Xun Memorial Hall."
        ),
        meta: localize(
          "展厅方案设计, 2025",
          "Exhibition proposal design, 2025"
        ),
        externalUrl:
          "https://www.processon.io/embed/6a39f9a3b19b00303db7f54f?lang=en-US",
        imageRatio: 1024 / 768,
        image: {
          src: "/LX1.png",
          alt: localize(
            "Rhythm 安静分析面板示意",
            "Shanghai Lu Xun Memorial Hall project image"
          ),
        },
      },
      {
        id: "groove",
        icon: "wand",
        iconLabel: localize("展台设计", "Booth Design"),
        title: localize(
          "US · Orlando KBIS 展台设计",
          "US · Orlando KBIS Booth Design"
        ),
        description: localize(
          "参与会展方案规划与落地深化，输出模型及效果参考。",
          "Participated in exhibition proposal planning and implementation refinement, producing models and visual references."
        ),
        meta: localize(
          "展台设计, 2025 in Orlando FL",
          "Booth design, 2025 in Orlando FL"
        ),
        externalUrl:
          "https://www.processon.io/embed/6a39f9c251bbd3339a8c941d?lang=en-US",
        imageRatio: 1024 / 768,
        image: {
          src: "/kbis photo.jpg",
          alt: localize(
            "Groove 预约流程示意",
            "Orlando KBIS booth design project image"
          ),
        },
      },
      {
        id: "fieldnote",
        icon: "layers",
        iconLabel: localize("方案设计", "Proposal Design"),
        title: localize(
          "上海 · 宋庆龄故居花园中的展厅",
          "Shanghai · Exhibition Hall in the Garden of the Former Residence of Soong Ching Ling"
        ),
        description: localize(
          "独立完成150㎡花园昆虫展厅设计，协调甲方与施工方，在预算内落地理想效果。",
          "Independently completed the 150㎡ garden insect exhibition hall design, coordinating with the client and contractors to deliver the desired result within budget."
        ),
        meta: localize("方案设计, 2025", "Proposal design, 2025"),
        externalUrl:
          "https://www.processon.io/embed/6a39f9dc51bbd3339a8c942e?lang=en-US",
        imageRatio: 1024 / 768,
        image: {
          src: "/KC1.png",
          alt: localize(
            "Fieldnote 研究工具示意",
            "Exhibition hall in the Soong Ching Ling Former Residence garden project image"
          ),
        },
      },
      {
        id: "talkback",
        icon: "bot",
        iconLabel: localize("展厅设计", "Exhibition Design"),
        title: localize(
          "上海宋陵 · 宋庆龄与国际传播 特展",
          "Shanghai Songling · Special Exhibition on Soong Ching Ling and International Communication"
        ),
        description: localize(
          "在《中国之声 世界之光—宋庆龄与国际传播》特展中，与部门协作共同完成整个特展的方案与效果设计。",
          "For the special exhibition 'The Voice of China, the Light of the World - Soong Ching Ling and International Communication', collaborated with the department to complete the overall proposal and visual design."
        ),
        meta: localize("展厅设计，2025", "Exhibition design, 2025"),
        externalUrl:
          "https://www.processon.io/embed/6a39f9f251bbd3339a8c943d?lang=en-US",
        imageRatio: 1024 / 768,
        image: {
          src: "/song11.png",
          alt: localize(
            "Talkback 对话界面示意",
            "Soong Ching Ling and International Communication special exhibition project image"
          ),
        },
      },
    ],
  },
  contact: {
    heading: {
      zh: "联系",
      en: "Contact",
    },
    description: {
      zh: "如果你想讨论新项目、想法，或只是想打个招呼，都可以直接联系我。",
      en: "If you want to discuss a new project, an idea, or just say hello, feel free to reach out.",
    },
    button: {
      zh: "联系我",
      en: "Contact",
      copied: {
        zh: "邮箱已复制",
        en: "Email copied",
      },
      prompt: {
        zh: "复制邮箱",
        en: "Copy email",
      },
    },
    secondary: {
      projects: {
        zh: "查看项目",
        en: "View projects",
      },
      home: {
        zh: "返回首页",
        en: "Back home",
      },
    },
    email: "1603483968@qq.com",
    socials: [
      {
        key: "mail",
        href: "mailto:1603483968@qq.com",
        label: { zh: "邮箱", en: "Email" },
      },
      {
        key: "linkedin",
        href: "https://www.linkedin.com/in/zhou-niko-992ba1306/?locale=en-US",
        label: { zh: "领英", en: "LinkedIn" },
        imageSrc: "/linkedin.svg",
      },
      {
        key: "x",
        href: "https://x.com",
        label: { zh: "X", en: "X" },
        imageSrc: "/x.svg",
      },
    ],
    footer: {
      built: {
        zh: "2026 © 使用 Next.js 构建",
        en: "2026 © Built with Next.js",
      },
      credit: {
        zh: "由 React Bits Pro 提供",
        en: "Provided by React Bits Pro",
      },
    },
  },
  about: {
    intro: {
      title: {
        zh: "ABOUT",
        en: "ABOUT",
      },
      description: {
        zh: "持续成长，专注自我提升、职业发展与长期价值积累。",
        en: "Keep growing, with a focus on self-improvement, career development, and long-term value accumulation.",
      },
      note: {
        zh: "以下信息都可以直接在 site-content.ts 里继续编辑。",
        en: "Everything below can be edited directly in site-content.ts.",
      },
      rows: [
        {
          label: { zh: "姓名", en: "Name" },
          value: { zh: "Niko Zhou", en: "Niko Zhou" },
        },
        {
          label: { zh: "背景", en: "Background" },
          value: {
            zh: "环境艺术设计 / 展览空间",
            en: "Environmental art design / exhibition spaces",
          },
        },
        {
          label: { zh: "现状", en: "Current status" },
          value: {
            zh: "作品集维护 / 项目整理 / 可编辑内容",
            en: "Portfolio upkeep / project curation / editable content",
          },
        },
      ],
    },
    sections: {
      experience: {
        title: { zh: "经历", en: "Experience" },
        note: {
          zh: "以下经历可直接在 site-content.ts 中编辑。",
          en: "These experience items can be edited directly in site-content.ts.",
        },
        items: [
          {
            period: { zh: "2025 — 至今", en: "2025 — Present" },
            title: { zh: "独立设计与作品集维护", en: "Independent design and portfolio upkeep" },
            subtitle: { zh: "个人网站 / 视觉系统", en: "Personal website / visual system" },
            description: {
              zh: "负责网站内容整理、页面结构迭代与视觉节奏维护，让项目信息可以持续更新。",
              en: "Responsible for content curation, page structure updates, and visual rhythm so project information can keep evolving.",
            },
          },
          {
            period: { zh: "2023 — 2025", en: "2023 — 2025" },
            title: { zh: "展览与空间视觉支持", en: "Exhibition and spatial visual support" },
            subtitle: { zh: "概念 / 平面 / 立面 / 效果", en: "Concept / plans / elevations / visuals" },
            description: {
              zh: "参与展览与空间项目的方案表达与视觉整理，推动图纸、效果图和现场沟通保持一致。",
              en: "Supported proposal storytelling and visual organization for exhibition and spatial projects, keeping drawings, renders, and site communication aligned.",
            },
          },
        ],
      },
      education: {
        title: { zh: "教育", en: "Education" },
        note: {
          zh: "以下教育信息可直接在 site-content.ts 中编辑。",
          en: "These education items can be edited directly in site-content.ts.",
        },
        items: [
          {
            period: { zh: "", en: "" },
            title: { zh: "本科 · 环境艺术设计", en: "Bachelor's degree · Environmental Art Design" },
            subtitle: { zh: "建筑 / 展示 / 空间表达", en: "Architecture / display / spatial expression" },
            description: {
              zh: "打下空间、展示与视觉表达的基础，并延伸到后续的项目叙事与数字化呈现。",
              en: "Built a foundation in spatial, exhibition, and visual expression, later extending into project storytelling and digital presentation.",
            },
          },
        ],
      },
      skills: {
        title: { zh: "技能", en: "Skills" },
        note: {
          zh: "这里保留为空，后续可按需补充技能标签。",
          en: "Kept blank for future skill tags.",
        },
      },
      stack: {
        title: { zh: "技术栈", en: "Stack" },
        note: {
          zh: "以下技术栈标签可直接在 site-content.ts 中编辑。",
          en: "These stack tags can be edited directly in site-content.ts.",
        },
        items: [
          localize("Next.js", "Next.js"),
          localize("React", "React"),
          localize("TypeScript", "TypeScript"),
          localize("Tailwind CSS", "Tailwind CSS"),
          localize("Motion", "Motion"),
          localize("Figma", "Figma"),
          localize("AutoCAD", "AutoCAD"),
          localize("Rhino", "Rhino"),
          localize("Photoshop", "Photoshop"),
        ],
      },
    },
    // Add `image: { src, alt }` to any slot to turn it into a real photo.
    // Remove a slot entirely if you want fewer images on the strip.
    polaroids: [
      { id: "a", rotate: -8 },
      { id: "b", rotate: 6 },
      { id: "c", rotate: -4 },
      { id: "d", rotate: 7 },
      { id: "e", rotate: -6 },
      { id: "f", rotate: 5 },
    ],
  },
  projectsIntro: {
    kicker: {
      zh: "项目总览 / Project index",
      en: "Project overview / Project index",
    },
    title: {
      zh: "实际落地的最新项目",
      en: "Recent realized projects",
    },
    description: {
      zh: "点击任意项目，可在新标签页打开对应的 ProcessOn 画布链接。",
      en: "Click any project to open the corresponding ProcessOn canvas link in a new tab.",
    },
  },
  systemCaseStudy: {
    badges: [
      { zh: "rbp 结构", en: "rbp structure" },
      { zh: "中文默认", en: "Chinese default" },
      { zh: "系统案例", en: "System case study" },
    ],
    eyebrow: {
      zh: "结构 / 工作流 / 叙事",
      en: "Structure / workflow / narrative",
    },
    headline: {
      zh: "不是工具，是队友。",
      en: "Not a tool. A teammate.",
    },
    intro: {
      zh: "这个版本把原本更喧闹的系统页面，翻译成了更安静的作品集语言：卡片、节奏和更清晰的阅读路径。",
      en: "This version turns the louder original system page into calmer portfolio language: cards, rhythm, and a clearer reading path.",
    },
    metrics: [
      {
        label: { zh: "层级", en: "Layers" },
        value: "3",
        copy: {
          zh: "研究、创建、运营",
          en: "research, creation, operations",
        },
      },
      {
        label: { zh: "模块", en: "Modules" },
        value: "8",
        copy: {
          zh: "可重复使用的习惯与输出",
          en: "repeatable habits and output",
        },
      },
      {
        label: { zh: "核心主张", en: "Core claim" },
        value: "1+AI",
        copy: {
          zh: "一个人就能形成团队感",
          en: "one person can feel like a team",
        },
      },
    ],
    designLabel: {
      zh: "设计说明",
      en: "Design note",
    },
    designCopy: {
      zh: "目标不是把原先的内容原样照搬，而是保留系统感、表达感和留白感，让它更适合 rbp 的作品集框架。",
      en: "The goal is not to recreate the original literally. It keeps the sense of system, expression, and blank space while fitting the rbp portfolio frame.",
    },
    designTags: [
      { zh: "蓝色强调", en: "blue emphasis" },
      { zh: "圆角卡片", en: "rounded cards" },
      { zh: "轻量动效", en: "light motion" },
      { zh: "易读文案", en: "readable copy" },
    ],
    shellLabel: {
      zh: "系统终端 ~ zsh",
      en: "system shell ~ zsh",
    },
    terminal: [
      {
        prompt: "$ ",
        command: "whoami",
        output: {
          zh: "匿名创作者",
          en: "Anonymous creator",
        },
      },
      {
        prompt: "$ ",
        command: "cat about.md",
        output: {
          zh: "个人资料已清空",
          en: "Profile cleared",
        },
      },
      {
        prompt: "$ ",
        command: 'echo "1 person + AI = 1 team"',
        output: {
          zh: "一个人 + AI = 一个团队",
          en: "1 person + AI = 1 team",
        },
        accent: true,
      },
      {
        prompt: "$ ",
        command: "open workspace.app",
        output: {
          zh: "中文优先的系统页面",
          en: "A Chinese-first system page",
        },
      },
    ],
    miniCards: [
      {
        title: {
          zh: "研究记忆",
          en: "Research memory",
        },
        copy: {
          zh: "日常笔记、简报和关键结论都被保留下来，方便再次调用。",
          en: "Daily notes, briefs, and key takeaways stay visible enough to be reused.",
        },
      },
      {
        title: {
          zh: "构建循环",
          en: "Build loop",
        },
        copy: {
          zh: "想法会更快从反思走向输出，再回到系统里继续更新。",
          en: "Ideas move more quickly from reflection to output and back into the system.",
        },
      },
    ],
    pillarsTitle: {
      zh: "三层结构，一种运行节奏。",
      en: "Three layers, one operating rhythm.",
    },
    pillars: [
      {
        icon: "compass" as const,
        label: { zh: "研究与思考", en: "Research & Thinking" },
        title: {
          zh: "先收集信号，再决定方向。",
          en: "Collect signals before choosing a direction.",
        },
        copy: {
          zh: "笔记、观察和 AI 提示都被收拢到同一条研究链路里，不再依赖一次性的灵感爆发。",
          en: "Notes, observations, and AI prompts live in one research loop instead of relying on one-off inspiration.",
        },
        bullets: [
          { zh: "每日简报", en: "Daily brief" },
          { zh: "信号扫描", en: "Signal scan" },
          { zh: "方向设定", en: "Direction setting" },
        ],
      },
      {
        icon: "sparkles" as const,
        label: { zh: "创建与构建", en: "Create & Build" },
        title: {
          zh: "把想法快速变成可交付的内容。",
          en: "Turn ideas into deliverables quickly.",
        },
        copy: {
          zh: "内容、视觉和小工具放在同一条生产链里，减少来回切换，让作品更快落地。",
          en: "Content, visuals, and small tools stay in one production loop so the work can ship before momentum fades.",
        },
        bullets: [
          { zh: "内容草稿", en: "Drafting" },
          { zh: "视觉生成", en: "Visuals" },
          { zh: "微型工具", en: "Micro tools" },
        ],
      },
      {
        icon: "workflow" as const,
        label: { zh: "分析与运营", en: "Analyze & Operate" },
        title: {
          zh: "让流程可复用，而不是只存在于记忆里。",
          en: "Make the workflow reusable instead of keeping it in memory only.",
        },
        copy: {
          zh: "运营节奏、SOP 和追踪信息放到同一套模型中，系统才会在普通日子里继续工作。",
          en: "Operational rhythm, SOPs, and tracking live in one model so the system still works on ordinary days.",
        },
        bullets: [
          { zh: "追踪", en: "Tracking" },
          { zh: "SOP", en: "SOPs" },
          { zh: "复盘", en: "Review" },
        ],
      },
    ],
    timelineTitle: {
      zh: "时间线",
      en: "Timeline",
    },
    timeline: [
      {
        index: "01",
        title: { zh: "搭建上下文层", en: "Build the context layer" },
        copy: {
          zh: "写作、研究和 AI 实验被整理成一张地图，而不是三套散开的东西。",
          en: "Writing, research, and AI experiments become one map instead of three disconnected tracks.",
        },
      },
      {
        index: "02",
        title: { zh: "把 AI 变成协作伙伴", en: "Use AI as a collaborator" },
        copy: {
          zh: "它不只是一个工具按钮，而是一个稳定的备忘、提示和回顾层。",
          en: "It becomes a stable layer for notes, prompts, and feedback rather than a simple tool button.",
        },
      },
      {
        index: "03",
        title: { zh: "把仪式变成流程", en: "Turn rituals into workflows" },
        copy: {
          zh: "日记、简报和复盘循环，让模糊的个人习惯变成可重复的系统。",
          en: "Journals, briefs, and review loops turn fuzzy personal habits into repeatable systems.",
        },
      },
      {
        index: "04",
        title: { zh: "让系统自己讲故事", en: "Let the system carry the story" },
        copy: {
          zh: "页面本身像一块更安静的桌面，把复杂内容压缩成更好读的结构。",
          en: "The page itself feels like a quieter desktop, compressing complex content into something easier to read.",
        },
      },
    ],
    changesTitle: {
      zh: "变化",
      en: "What changed",
    },
    outcomes: [
      {
        title: { zh: "减少切换成本", en: "Less context switching" },
        copy: {
          zh: "思考、写作和输出被放在同一条节奏里，日常推进会更稳。",
          en: "Thinking, writing, and shipping stay in one rhythm, which keeps daily progress steadier.",
        },
      },
      {
        title: { zh: "输出更容易复用", en: "More reusable output" },
        copy: {
          zh: "页面不再只讲一次性的灵感，而是强调模式、标签和能重复使用的结构。",
          en: "The page focuses less on one-off inspiration and more on patterns, labels, and reusable structures.",
        },
      },
      {
        title: { zh: "身份更清晰", en: "A clearer identity" },
        copy: {
          zh: "核心主张很简单：一个人加上 AI，可以像一个小团队一样协作。",
          en: "The core claim stays simple: one person plus AI can behave like a small aligned team.",
        },
      },
    ],
    quote: {
      zh: "不是工具，是队友。",
      en: "Not a tool. A teammate.",
    },
    quoteNote: {
      zh: "这就是整个系统想传达的核心。",
      en: "That is the whole point of the system.",
    },
  },
} as const;
