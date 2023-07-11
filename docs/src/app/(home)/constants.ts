interface Feature {
  icon: string;
  label: string;
  description: string;
}

export const FEATURES_LIST: Feature[] = [
  {
    icon: "✊",
    label: "Zero-config",
    description: "No configuration needed to get started...",
  },
  {
    icon: "⛏️",
    label: "Configurable",
    description:
      "...yet there are many options available to extend the plugin.",
  },
  {
    icon: "💯",
    label: "Fast",
    description: "Blow your user's mind with a website as fast as lightning ⚡",
  },
  {
    icon: "🔌",
    label: "Offline",
    description: "Proper offline support. For both App and Pages Router.",
  },
  {
    icon: "🚀",
    label: "Developer experience",
    description:
      "Built-in TypeScript definitions and JSDoc to enable the best DX.",
  },
];
