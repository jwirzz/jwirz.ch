import type { Site, Metadata, Socials } from "@types";

export const SITE: Site = {
  NAME: "Jonathan",
  EMAIL: "jonathan.wirz@proton.me",
  NUM_POSTS_ON_HOMEPAGE: 3,
  NUM_WORKS_ON_HOMEPAGE: 2,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "Hey, I’m Jonathan Wirz. I like building fun, creative things for the web and learning as I go. This is where I share what I make and what inspires me.",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "This is my little space to share what I learn, what inspires me, and the things I find worth remembering along the way.",
};
export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION: "A collection of my projects, with links to repositories and demos.",
};

export const SOCIALS: Socials = [
  { 
    NAME: "twitter-x",
    HREF: "https://x.com/notacodes",
  },
  { 
    NAME: "github",
    HREF: "https://github.com/notacodes"
  },
];
