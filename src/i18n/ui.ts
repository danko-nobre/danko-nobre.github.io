export const languages = { pt: 'PT', en: 'EN' } as const;
export type Locale = keyof typeof languages;
export const defaultLocale: Locale = 'pt';

export const ui = {
  pt: {
    htmlLang: 'pt-BR',
    ogLocale: 'pt_BR',
    meta: {
      title: 'Danko - Dev Full-Stack, Game Dev e Generalista 3D',
      description:
        'Danko - desenvolvedor full-stack, entusiasta de game dev, generalista 3D e co-fundador do Space Wizard Studios.',
    },
    about: {
      label: 'cat bio.md',
      description: 'Curioso por natureza, dev por escolha. Construo no espaço entre design, código e arte.',
      highlights: [
        {
          icon: 'code',
          title: 'Dev Full-Stack',
          description:
            'Autodidata em TypeScript/JavaScript. Desenvolvo tanto no front quanto no back. Meu foco é em React, Tailwind e Astro, mas finjo que sei trabalhar com PHP, SQL e Node.js.',
        },
        {
          icon: 'rocket',
          title: 'Space Wizard',
          description:
            'Co-fundador e gerente de projetos em um estúdio criativo que constrói websites, apps nativos/mobile e outras mídias.',
        },
        {
          icon: 'briefcase',
          title: 'TSE - Tribunal Superior Eleitoral',
          description:
            'Desenvolvedor web construindo soluções educacionais que alcançam mais de 2 milhões de usuários em anos eleitorais.',
        },
        {
          icon: 'box',
          title: '3D & Game Dev',
          description:
            'Apaixonado por game dev e 3D: produzo com Blender, ZBrush, 3D Coat - modelagem, texturização, rigging e animação.',
        },
      ],
    },
    projects: {
      label: 'ls -la',
      description: 'Algumas coisas que construí ou ajudei a construir.',
      visit: 'Visitar',
      items: [
        {
          title: 'Space Wizard',
          description: 'Estúdio criativo que sou co-fundador, onde construímos experiências web, apps e jogos.',
        },
        {
          title: 'Firebound',
          description: 'Uma framework para jogos de roguelike com batalha por turnos construído em C# com Godot Engine.',
        },
        {
          title: 'FairCut',
          description: 'SaaS de acompanhamento financeiro para estúdios de jogos.',
        },
      ],
    },
    skills: {
      label: 'which *',
      description: 'Ferramentas que uso pra dar vida a ideias.',
    },
    contact: {
      label: 'ssh dnk@',
      description: 'Vamos construir algo incrível juntos?',
    },
    footer: {
      builtWith: 'Construído com café e código',
      available: 'Disponível para projetos',
    },
  },
  en: {
    htmlLang: 'en',
    ogLocale: 'en_US',
    meta: {
      title: 'Danko - Full-Stack Dev, Game Dev and 3D Generalist',
      description:
        'Danko - full-stack developer, game dev enthusiast, 3D generalist, and co-founder of Space Wizard Studios.',
    },
    about: {
      label: 'cat bio.md',
      description: 'Curious by nature, dev by choice. I build in the space between design, code, and art.',
      highlights: [
        {
          icon: 'code',
          title: 'Full-Stack Dev',
          description:
            'Self-taught in TypeScript/JavaScript. I work both front and back. Focused on React, Tailwind, and Astro — and pretend to know PHP, SQL, and Node.js.',
        },
        {
          icon: 'rocket',
          title: 'Space Wizard',
          description:
            'Co-founder and project manager at a creative studio building websites, native/mobile apps, and other media.',
        },
        {
          icon: 'briefcase',
          title: 'TSE - Brazilian Superior Electoral Court',
          description:
            'Web developer building educational tools that reach over 2 million users during election years.',
        },
        {
          icon: 'box',
          title: '3D & Game Dev',
          description:
            'Passionate about game dev and 3D: working with Blender, ZBrush, 3D Coat — modeling, texturing, rigging, and animation.',
        },
      ],
    },
    projects: {
      label: 'ls -la',
      description: 'A few things I built or helped build.',
      visit: 'Visit',
      items: [
        {
          title: 'Space Wizard',
          description: 'Creative studio I co-founded, where we build web experiences, apps, and games.',
        },
        {
          title: 'Firebound',
          description: 'A framework for turn-based roguelike games built in C# with Godot Engine.',
        },
        {
          title: 'FairCut',
          description: 'Financial tracking SaaS for game studios.',
        },
      ],
    },
    skills: {
      label: 'which *',
      description: 'Tools I use to bring ideas to life.',
    },
    contact: {
      label: 'ssh dnk@',
      description: "Let's build something amazing together?",
    },
    footer: {
      builtWith: 'Built with coffee and code',
      available: 'Available for projects',
    },
  },
} as const;

export function getLocale(astroLocale: string | undefined): Locale {
  return astroLocale === 'en' ? 'en' : 'pt';
}

export function t(locale: Locale) {
  return ui[locale];
}

export function altHref(locale: Locale): string {
  return locale === 'pt' ? '/en/' : '/';
}
