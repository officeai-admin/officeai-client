import {
  FileText,
  Globe,
  History,
  Image as ImageIcon,
  ListChecks,
  LogIn,
  MessageSquare,
  Paperclip,
  Pencil,
  SlidersHorizontal,
  Sun,
  Type,
  type LucideIcon,
} from "lucide-react";

/**
 * All landing copy lives here, so wording changes happen in one place.
 * Product statements describe what the code in src/ does; pricing and contact details are placeholders.
 */

export const site = {
  brand: "Office AI",
  formTitle: "[Office AI]",
  title: "Office AI: one assistant for questions, research and files",
  pricingTitle: "Plans and pricing: Office AI",
  footerLine: "A chat assistant with research, summaries and document tools.",
  year: 2026,
};

export const hero = {
  title: "One assistant for questions, research and files.",
  sub: "Office AI answers questions in chat, researches the web with sources, summarizes conversations, and works with your PDFs and images.",
  primary: "Get started",
  secondary: "See how it works",
};

/** A short specification, read straight from the code: accepted input, modes, tools, sign-in, themes. */
export const spec: { label: string; value: string }[] = [
  { label: "Input", value: "Text, images and PDFs up to 6 MB" },
  { label: "Modes", value: "GPT-Style, Fast, Reasoning" },
  { label: "Tools", value: "Research agent, PDF data extractor, alt-text generator" },
  { label: "Sign-in", value: "Google or email, needed to chat" },
  { label: "Themes", value: "Light, dark, system" },
];

/** What the lettered callouts on the chat preview point at. */
export const callouts: { letter: string; text: string }[] = [
  { letter: "A", text: "Sidebar: new chat, search, and history grouped by date. A drawer on phones." },
  { letter: "B", text: "Header: the conversation title. Click it to rename the conversation." },
  { letter: "C", text: "Thread: answers in Markdown, code blocks with copy, and message actions." },
  { letter: "D", text: "Message box: the paperclip for images and PDFs, then send." },
];

export const featuresIntro = {
  title: "What Office AI does",
  lead: "A chat assistant with the controls you expect, a history you can search, and three tools for research and documents.",
};

export interface Feature {
  id: string;
  group: string;
  icon: LucideIcon;
  title: string;
  body: string;
}

export const features: Feature[] = [
  {
    id: "chat",
    group: "Chat",
    icon: MessageSquare,
    title: "Chat with Markdown answers",
    body: "Ask a question and the answer arrives formatted in Markdown, with one-click copy on code blocks. Starter prompts help you begin.",
  },
  {
    id: "actions",
    group: "Chat",
    icon: Pencil,
    title: "Edit and regenerate",
    body: "Edit a message you sent, regenerate the last answer, or retry one that failed. Copy any message and rate answers up or down.",
  },
  {
    id: "modes",
    group: "Chat",
    icon: SlidersHorizontal,
    title: "Assistant modes",
    body: "Choose GPT-Style Assistant, Fast Assistant or Reasoning Assistant for each conversation, from the chat header.",
  },
  {
    id: "attachments",
    group: "Chat",
    icon: Paperclip,
    title: "Attachments",
    body: "Attach images and PDFs up to 6 MB with the paperclip or by drag and drop. Each file is uploaded as a document, with its upload status shown.",
  },
  {
    id: "history",
    group: "Organize",
    icon: History,
    title: "Conversation history",
    body: "The sidebar groups conversations by Today, Yesterday, Previous 7 days and Older. Search, rename and delete from the same place.",
  },
  {
    id: "titles",
    group: "Organize",
    icon: Type,
    title: "Automatic titles",
    body: "Each new conversation is titled automatically from your first message, so the list stays easy to scan.",
  },
  {
    id: "summary",
    group: "Organize",
    icon: ListChecks,
    title: "Conversation summary",
    body: "Press Summarize to get a summary, key points and action items for the conversation you are in.",
  },
  {
    id: "research",
    group: "Tools",
    icon: Globe,
    title: "Research agent",
    body: "Give it a topic. It searches the web and streams a written brief with linked sources.",
  },
  {
    id: "pdf",
    group: "Tools",
    icon: FileText,
    title: "PDF data extractor",
    body: "Choose a PDF from the sidebar tool and upload it to the knowledge base. It reports how many chunks were stored.",
  },
  {
    id: "alt",
    group: "Tools",
    icon: ImageIcon,
    title: "Alt-text generator",
    body: "Upload an image and get accessible alt text, ready to copy.",
  },
  {
    id: "signin",
    group: "Access",
    icon: LogIn,
    title: "Sign-in",
    body: "Sign in with your Google account, or with an email address and password. The chat opens once you are signed in.",
  },
  {
    id: "themes",
    group: "Access",
    icon: Sun,
    title: "Themes and responsive layout",
    body: "Light, dark and system themes. The layout adapts from desktop to phone with a collapsible sidebar and a mobile drawer.",
  },
];

export const flowsIntro = {
  title: "How it works",
  lead: "Seven short paths through the product, from the first sign-in to a finished research brief.",
};

export const flows: { id: string; name: string; steps: string[] }[] = [
  {
    id: "get-started",
    name: "Get started",
    steps: ["Sign in with Google or email", "Land on the welcome screen", "Pick a suggestion or type a question"],
  },
  {
    id: "chat",
    name: "Chat",
    steps: [
      "Ask",
      "Read the answer",
      "Edit, regenerate, copy or rate",
      "The conversation is titled automatically",
      "Find it later with search",
    ],
  },
  {
    id: "attach",
    name: "Attach a file",
    steps: ["Drop an image or PDF onto the message box", "It uploads as a document", "Send your message"],
  },
  {
    id: "summarize",
    name: "Summarize",
    steps: ["Press Summarize", "Get a summary, key points and action items"],
  },
  {
    id: "research",
    name: "Research",
    steps: ["Open the Research agent", "Enter a topic", "It searches the web", "Read the brief with sources"],
  },
  {
    id: "extract",
    name: "Upload a PDF",
    steps: ["Open the PDF data extractor", "Choose a PDF", "Upload it to the knowledge base"],
  },
  {
    id: "describe",
    name: "Describe an image",
    steps: ["Upload an image", "Get alt text", "Copy it"],
  },
];

export const faqIntro = { title: "Questions and answers" };

export const faq: { q: string; a: string }[] = [
  {
    q: "What can I ask Office AI?",
    a: "Anything you would ask a chat assistant: explain a concept, write or debug code, generate ideas. Answers are formatted in Markdown, and code blocks have a copy button.",
  },
  {
    q: "What are the assistant modes?",
    a: "There are three: GPT-Style Assistant, Fast Assistant and Reasoning Assistant. You choose one per conversation from the menu in the chat header.",
  },
  {
    q: "Which files can I attach?",
    a: "Images and PDFs, up to 6 MB per file. Use the paperclip or drag files onto the message box. Each file is uploaded as a document, so you need to be signed in.",
  },
  {
    q: "How do I sign in?",
    a: "With your Google account in one click, or with an email address and password. You need to be signed in to use the chat.",
  },
  {
    q: "How do I find an earlier conversation?",
    a: "Open the sidebar. Conversations are grouped by Today, Yesterday, Previous 7 days and Older, each with an automatic title. You can also search, rename and delete them.",
  },
  {
    q: "Where does the Research agent get its information?",
    a: "It runs a web search for your topic, writes a brief from what it finds, and lists the sources as links.",
  },
  {
    q: "Does it work on a phone?",
    a: "Yes. The layout is responsive, the sidebar becomes a drawer on small screens, and you can switch between light, dark and system themes.",
  },
  {
    q: "How much does it cost?",
    a: "Pricing is not final yet. The plans on the pricing page are placeholders while that is decided.",
  },
];

export const cta = {
  title: "Start with a question.",
  lead: "Create an account and ask the first thing on your mind.",
  primary: "Get started",
  secondary: "Contact us",
};

// ---- Pricing page ------------------------------------------------------
// PLACEHOLDER: plan names, prices and the split of features between plans are not decided.

export const pricingIntro = {
  title: "Plans and pricing",
  lead: "Three plans, from trying it out to using it with a team.",
  note: "Pricing has not been finalized. The plans and prices on this page are placeholders.",
};

export interface Plan {
  id: string;
  name: string;
  price: string;
  unit: string;
  blurb: string;
  cta: string;
  /** "start" opens the sign-up page; "contact" jumps to the contact section. */
  action: "start" | "contact";
  featured?: boolean;
  lead: string;
  features: string[];
}

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "0",
    unit: "per month",
    blurb: "For trying the assistant.",
    cta: "Get started",
    action: "start",
    lead: "Includes:",
    features: [
      "Chat with Markdown answers and code copy",
      "All three assistant modes",
      "Conversation history, search and automatic titles",
      "Image and PDF attachments up to 6 MB",
      "Light, dark and system themes",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "12",
    unit: "per month",
    blurb: "For everyday work.",
    cta: "Get started",
    action: "start",
    featured: true,
    lead: "Everything in Free, plus:",
    features: ["Conversation summaries", "Research agent", "PDF data extractor", "Alt-text generator"],
  },
  {
    id: "team",
    name: "Team",
    price: "29",
    unit: "per user, per month",
    blurb: "For groups that share a bill.",
    cta: "Contact us",
    action: "contact",
    lead: "Everything in Pro, plus:",
    features: ["A seat for each member", "One invoice for the whole team", "Help getting your team set up"],
  },
];

export const compareIntro = { title: "Compare plans" };

/** Each row: the feature, then whether Free, Pro and Team include it. */
export const compare: { group: string; rows: [string, boolean, boolean, boolean][] }[] = [
  {
    group: "Chat",
    rows: [
      ["Chat with Markdown answers and code copy", true, true, true],
      ["Edit and regenerate", true, true, true],
      ["GPT-Style, Fast and Reasoning modes", true, true, true],
      ["Image and PDF attachments up to 6 MB", true, true, true],
    ],
  },
  {
    group: "Organize",
    rows: [
      ["Conversation history and search", true, true, true],
      ["Automatic titles", true, true, true],
      ["Conversation summary", false, true, true],
    ],
  },
  {
    group: "Tools",
    rows: [
      ["Research agent", false, true, true],
      ["PDF data extractor", false, true, true],
      ["Alt-text generator", false, true, true],
    ],
  },
  {
    group: "Account",
    rows: [
      ["Google or email sign-in", true, true, true],
      ["Light, dark and system themes", true, true, true],
      ["One invoice for the whole team", false, false, true],
      ["Help getting your team set up", false, false, true],
    ],
  },
];

// PLACEHOLDER: these addresses are not real. The form itself is delivered by StaticForms (see ContactForm).
export const contact = {
  title: "Contact us",
  lead: "Ask about plans, or anything these pages did not answer.",
  details: [
    { label: "General", value: "hello@example.com" },
    { label: "Sales", value: "sales@example.com" },
    { label: "Support", value: "support@example.com" },
  ],
  topics: ["General question", "Plans and pricing", "Team plan", "Something else"],
  submit: "Send message",
  sending: "Sending",
  sent: "Thanks. Your message has been sent.",
  failed: "Your message could not be sent. Please try again in a moment, or email us instead.",
  notConnected: "This form is not connected yet. Please email us instead.",
};

// ---- Sign in and sign up -----------------------------------------------

export const auth = {
  signIn: {
    title: "Sign in",
    pageTitle: "Sign in: Office AI",
    submit: "Sign in",
    busy: "Signing in",
    switchPrompt: "New here?",
    switchLink: "Create an account",
  },
  signUp: {
    title: "Create your account",
    pageTitle: "Create your account: Office AI",
    submit: "Create account",
    busy: "Creating account",
    switchPrompt: "Already have an account?",
    switchLink: "Sign in",
  },
  lead: "Chatting, uploading files and your conversation history all need a signed-in account.",
  google: "Continue with Google",
  passwordHelp: "At least 6 characters.",
  confirmSent: "Check your email. We sent a link to confirm your address; open it to finish signing up.",
};
