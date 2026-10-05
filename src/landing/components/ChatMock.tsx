import { Fragment, useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Copy,
  Monitor,
  Moon,
  Paperclip,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Sun,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const icon = { className: "ic", size: 14, strokeWidth: 1.75, "aria-hidden": true } as const;

const HISTORY: { group: string; titles: string[] }[] = [
  { group: "Today", titles: ["Debounce in JavaScript", "Packing list for a week away"] },
  { group: "Yesterday", titles: ["Lease agreement questions", "Weeknight dinner ideas"] },
  { group: "Previous 7 days", titles: ["Fixing a null pointer error", "Quarterly report outline"] },
];

/**
 * A stylised preview of the chat app, built from its real labels. It is one image to assistive
 * technology. The sample reply appears the way the app replies: a typing indicator, then the
 * whole answer at once.
 */
export function ChatMock() {
  const reduceMotion = usePrefersReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (reduceMotion || !frame) return;

    let timer: number | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        timer = window.setTimeout(() => setAnswered(true), 1600);
      },
      { threshold: 0.4 }
    );
    observer.observe(frame);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [reduceMotion]);

  const phase = answered || reduceMotion ? "done" : "typing";

  return (
    <div className="mk-frame" ref={frameRef}>
      <div
        className="mk-app"
        role="img"
        aria-label="Preview of the Office AI chat: conversation history in a sidebar, an answer with a code block, and the message box"
      >
        <div className="mk-side">
          <div className="mk-brand">
            <span className="mk-logo">
              <Sparkles {...icon} />
            </span>
            <span>Office AI</span>
          </div>
          <div className="mk-new">
            <Plus {...icon} />
            <span>New chat</span>
          </div>
          <div className="mk-search">
            <Search {...icon} />
            <span>Search chats</span>
          </div>
          {HISTORY.map(({ group, titles }) => (
            <Fragment key={group}>
              <p className="mk-group">{group}</p>
              <ul className="mk-list">
                {titles.map((title, index) => (
                  <li key={title} className={group === "Today" && index === 0 ? "is-active" : undefined}>
                    {title}
                  </li>
                ))}
              </ul>
            </Fragment>
          ))}
          <div className="mk-side-foot">
            <span className="mk-theme">
              <Sun {...icon} />
              <Moon {...icon} />
              <Monitor {...icon} />
            </span>
            <span className="mk-avatar">J</span>
          </div>
        </div>

        <div className="mk-main">
          <div className="mk-head">
            <span className="mk-title">Debounce in JavaScript</span>
          </div>

          <div className="mk-thread">
            <div className="mk-msg mk-user">
              <p>Explain debouncing in JavaScript and show a short example.</p>
            </div>
            <div className="mk-msg mk-bot" data-phase={phase}>
              <span className="mk-typing">
                <i />
                <i />
                <i />
              </span>
              <div className="mk-answer">
                <p>
                  <strong>Debouncing</strong> waits until calls stop arriving for a set time, then runs the
                  function once. It suits search boxes and resize handlers.
                </p>
                <div className="mk-code">
                  <div className="mk-code-bar">
                    <span>javascript</span>
                    <span className="mk-copy">
                      <Copy {...icon} />
                      Copy
                    </span>
                  </div>
                  <pre>
                    <code>
                      <span className="tk-k">function</span> <span className="tk-f">debounce</span>(fn, ms ={" "}
                      <span className="tk-n">300</span>) {"{\n"}
                      {"  "}
                      <span className="tk-k">let</span> t;{"\n"}
                      {"  "}
                      <span className="tk-k">return</span> (...args) =&gt; {"{\n"}
                      {"    clearTimeout(t);\n"}
                      {"    t = setTimeout(() => fn(...args), ms);\n"}
                      {"  };\n"}
                      {"}"}
                    </code>
                  </pre>
                </div>
                <div className="mk-actions">
                  <Copy {...icon} />
                  <ThumbsUp {...icon} />
                  <ThumbsDown {...icon} />
                  <RotateCcw {...icon} />
                </div>
              </div>
            </div>
          </div>

          <div className="mk-input">
            <Paperclip {...icon} />
            <span className="mk-placeholder">Ask anything...</span>
            <span className="mk-send">
              <ArrowUp {...icon} size={16} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
