'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { CountUp } from "@/components/ui";
import { useApp } from "@/components/AppProvider";
import { dialects, huayKuan, lessons } from "@/data/staticData";

export default function AboutPage() {
  const router = useRouter();
  const { registeredUsers, apiWords } = useApp();
  const [aboutFaqOpen, setAboutFaqOpen] = useState(null);
  const [aboutStatsVisible, setAboutStatsVisible] = useState(false);
  const [aboutCopied, setAboutCopied] = useState(null);

  useEffect(() => {
    const el = document.getElementById("about-stats");
    if (!el || aboutStatsVisible) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setAboutStatsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [aboutStatsVisible]);

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "60px 24px" }} className="fade-up">

      {/* 1. HERO */}
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <div style={{ marginBottom: 28 }}>
          <Image src="/logo/02-vertical-cropped.png" alt="tiagong.sg" width={280} height={248} priority style={{ width: "100%", height: "auto", maxWidth: 280, margin: "0 auto" }} />
        </div>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 44, fontWeight: 700, color: "#1A1208", lineHeight: 1.15, marginBottom: 14 }}>
          A language lost is a <em style={{ color: "#C0392B" }}>worldview lost.</em>
        </h1>
        <p style={{ color: "#6B5B45", fontSize: 17, lineHeight: 1.6, maxWidth: 560, margin: "0 auto" }}>
          We're rebuilding the bridge between generations — one phrase at a time.
        </p>
      </div>

      {/* 2. LIVE IMPACT STATS */}
      <div id="about-stats" className="about-stats-grid" style={{ marginBottom: 64 }}>
        {(() => {
          const lessonEntries = Object.values(lessons).reduce((sum, dialectData) => sum + Object.values(dialectData).reduce((s, arr) => s + arr.length, 0), 0);
          return [
            { label: "Learners", value: registeredUsers.length },
            { label: "Phrases", value: lessonEntries + apiWords.length },
            { label: "Dialects", value: dialects.length },
            { label: "Associations", value: huayKuan.length },
          ];
        })().map(s => (
          <div key={s.label} className="about-stat-card">
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 44, fontWeight: 700, color: "#C0392B", lineHeight: 1 }}>
              {s.value > 0 ? <CountUp value={s.value} active={aboutStatsVisible} /> : "—"}
            </div>
            <div style={{ fontSize: 12, color: "#8B7355", letterSpacing: 2, textTransform: "uppercase", marginTop: 8, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* 3. THE STORY */}
      <div style={{ marginBottom: 64 }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 12, fontWeight: 700, color: "#C0392B", letterSpacing: 3, textTransform: "uppercase", marginBottom: 20 }}>The Story</h2>
        {[
          {
            title: "A Heritage at Risk",
            body: "Since the 1980 Speak Mandarin Campaign, dialect use in Singapore's Chinese households has fallen dramatically. Where once Hokkien, Cantonese, Teochew, Hakka, and Hainanese filled wet markets, kopitiams, and family dinners, today many young Singaporeans can no longer hold a full conversation with their grandparents.",
            quote: "「老人言，金不換。」 — A grandparent's words are worth more than gold."
          },
          {
            title: "What We Stand to Lose",
            body: "Dialects carry what Mandarin and English cannot. Hokkien proverbs about the sea and sweat. Cantonese banter that turns kinship into comedy. Teochew lullabies. Hakka resilience. Hainanese coffee orders. When a dialect goes quiet, an entire way of seeing the world goes with it — recipes, rituals, jokes, kinship terms that have no equivalent anywhere else."
          },
          {
            title: "How tiagong.sg Helps",
            body: "We're not trying to replace your grandparents — we're trying to give you a reason to call them. tiagong.sg is a starting point: a phrase, a tone, a conversation opener. The real learning happens at the dinner table. Use the platform to begin; let your family teach you the rest."
          }
        ].map((s) => (
          <div key={s.title} style={{ background: "white", borderRadius: 16, padding: "28px 30px", marginBottom: 18, boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid #F0E8DA" }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 26, fontWeight: 700, color: "#1A1208", marginBottom: 12 }}>{s.title}</div>
            <p style={{ color: "#6B5B45", lineHeight: 1.75, fontSize: 15 }}>{s.body}</p>
            {s.quote && (
              <div style={{ marginTop: 16, paddingLeft: 16, borderLeft: "3px solid #C0392B", fontFamily: "var(--font-chinese)", fontStyle: "italic", color: "#8B7355", fontSize: 14, lineHeight: 1.6 }}>
                {s.quote}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 4. HOW IT WORKS */}
      <div style={{ marginBottom: 64 }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 12, fontWeight: 700, color: "#C0392B", letterSpacing: 3, textTransform: "uppercase", marginBottom: 20 }}>How It Works</h2>
        <div className="about-steps-grid">
          {[
            { num: "1", color: "#C0392B", title: "Choose your dialect", desc: "Five Singapore dialects to explore — pick where your roots lie, or where curiosity leads.", target: "/" },
            { num: "2", color: "#8E44AD", title: "Learn phrases & idioms", desc: "Flashcards, story quizzes, and fill-in-the-blank exercises to build vocabulary your grandparents would recognise.", target: "/" },
            { num: "3", color: "#1A6B3C", title: "Find a Sin Seh", desc: "Connect with fluent mentors in our community who can guide you through real conversations.", target: "/?screen=network" },
            { num: "4", color: "#D4860B", title: "Practice in Singlish", desc: "See how dialect words already live in everyday Singlish — and use them with confidence.", target: "/singlish" },
          ].map(s => (
            <div key={s.num} onClick={() => router.push(s.target)} className="about-step-card" style={{ borderTopColor: s.color }}>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 38, fontWeight: 700, color: s.color, lineHeight: 1, marginBottom: 12 }}>0{s.num}</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 700, color: "#1A1208", marginBottom: 8 }}>{s.title}</div>
              <p style={{ color: "#6B5B45", lineHeight: 1.6, fontSize: 14 }}>{s.desc}</p>
              <div style={{ marginTop: 14, color: s.color, fontSize: 13, fontWeight: 600, letterSpacing: 0.5 }}>Go &rarr;</div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. FOUNDER NOTE */}
      <div style={{ background: "linear-gradient(135deg, #FDF6EE, #F5EFE6)", borderRadius: 16, padding: "32px 36px", marginBottom: 64, border: "1px solid #EDE0CC" }}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 12, fontWeight: 700, color: "#C0392B", letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>Founder Note</div>
        <p style={{ color: "#3D2A18", fontSize: 16, lineHeight: 1.8, fontStyle: "italic", margin: 0 }}>
          Built by <strong style={{ fontStyle: "normal", color: "#1A1208" }}>Raphael</strong>, a Singaporean who spent much of his childhood in his grandparents' Teochew-speaking household. Nostalgic for those days, he is building a platform where the social significance of culture and heritage can still shine in an increasingly monolingual Singapore.
        </p>
      </div>

      {/* 6. BECOME A DIALECT CURATOR */}
      <div style={{ background: "linear-gradient(135deg, #1A1208 0%, #2C1810 50%, #3D1F10 100%)", borderRadius: 20, padding: "40px 36px", marginBottom: 64, border: "1px solid #3D2A18" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#C0392B", letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 }}>Join the Team</div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 34, fontWeight: 700, color: "#F5E6C8", lineHeight: 1.2, marginBottom: 14 }}>
            Speak a dialect fluently?<br /><em style={{ color: "#E8D4A8" }}>Help validate our dictionary.</em>
          </h2>
          <p style={{ color: "#C9B58E", fontSize: 15, lineHeight: 1.7, maxWidth: 600, margin: "0 auto" }}>
            Right now, our phrases are drafted with the help of AI (Qwen and Claude). We need fluent speakers — our <strong style={{ color: "#F5E6C8" }}>Dialect Curators</strong> — to review and refine each entry, making sure the translations, romanisations, and tones ring true to how the dialect is actually spoken. Curators are our linguistic and language researchers — credited on the platform, with early access to new features and a direct hand in shaping how Singapore's dialect heritage is preserved online.
          </p>
        </div>
        <div className="about-curator-grid">
          {dialects.map(d => (
            <a
              key={d.id}
              href={`mailto:raphaeleeingwi@gmail.com?subject=${encodeURIComponent(`Dialect Curator — ${d.name}`)}&body=${encodeURIComponent(`Hi Raphael,\n\nI'd like to help validate ${d.name} (${d.chinese}) entries on tiagong.sg.\n\nA bit about my background:\n\n— `)}`}
              className="about-curator-card"
              style={{ borderColor: `${d.color}66`, background: `${d.color}11` }}
            >
              <div style={{ fontFamily: "var(--font-chinese)", fontSize: 22, fontWeight: 700, color: d.color, marginBottom: 4 }}>{d.chinese}</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 17, fontWeight: 700, color: "#F5E6C8", marginBottom: 8 }}>
                {d.name}<br />Curator
              </div>
              <div style={{ fontSize: 12, color: d.color, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Volunteer &rarr;</div>
            </a>
          ))}
        </div>
      </div>

      {/* 7. FAQ */}
      <div style={{ marginBottom: 64 }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 12, fontWeight: 700, color: "#C0392B", letterSpacing: 3, textTransform: "uppercase", marginBottom: 20 }}>Frequently Asked</h2>
        {[
          { q: "Is tiagong.sg free?", a: "Yes, completely free. This is a non-commercial project for cultural preservation — no paywalls, no ads." },
          { q: "Why these five dialects?", a: "Hokkien, Cantonese, Teochew, Hakka, and Hainanese are the major Chinese dialect groups in Singapore by historical immigration. They shaped the kopitiam, the wet market, and the family table." },
          { q: "Who built this?", a: "Raphael — a Singaporean who grew up in a Teochew-speaking household and wanted a way to keep that world alive. See the Founder Note above." },
          { q: "How are the phrases sourced?", a: "Right now, the dictionary is being compiled with the help of large language models (Qwen and Claude). We're aware that AI-generated translations need human verification — which is exactly why we're building a team of Dialect Curators (see above) to validate every entry. We'd rather be transparent about this than hide it." },
          { q: "What's a \"Sin Seh\"?", a: "Sin Seh (先生) is the Hokkien/Teochew term for a teacher, doctor, or wise mentor. The mentorship feature pairs learners with fluent speakers in the community who are willing to teach." },
          { q: "Can I contribute phrases or corrections?", a: "Yes — either by joining the Dialect Curators team (above) or by emailing us directly. Every correction makes the platform more accurate for the next learner." },
          { q: "Is my learning data private?", a: "Your progress is stored only to track your own learning journey. We don't sell or share data, and we don't run third-party trackers." },
          { q: "Will more dialects be added?", a: "The focus is on Singapore's five main dialects. Extensions to other dialects (Foochow / Hock Chew, Henghua, etc.) are possible in the future as the curator team grows." },
        ].map((item, i) => {
          const open = aboutFaqOpen === i;
          return (
            <div key={i} className="about-faq-item" style={{ background: "white", borderRadius: 12, marginBottom: 10, border: "1px solid #F0E8DA", overflow: "hidden" }}>
              <button
                onClick={() => setAboutFaqOpen(open ? null : i)}
                style={{ width: "100%", textAlign: "left", padding: "18px 22px", background: "transparent", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "inherit", fontSize: 15, fontWeight: 600, color: "#1A1208" }}
              >
                <span>{item.q}</span>
                <span style={{ color: "#C0392B", fontSize: 18, transform: open ? "rotate(45deg)" : "rotate(0)", transition: "transform 0.2s" }}>+</span>
              </button>
              {open && (
                <div style={{ padding: "0 22px 20px", color: "#6B5B45", lineHeight: 1.75, fontSize: 14.5 }}>
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 8. ROADMAP */}
      <div style={{ marginBottom: 64 }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 12, fontWeight: 700, color: "#C0392B", letterSpacing: 3, textTransform: "uppercase", marginBottom: 20 }}>What's Next</h2>
        <div style={{ background: "white", borderRadius: 16, padding: "28px 32px", border: "1px solid #F0E8DA", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              ["Curator-validated dictionary", "Replace AI drafts with fluent-speaker-verified entries across all five dialects."],
              ["Audio pronunciation", "Native-speaker recordings for every phrase — so learners hear, not just read."],
              ["Classroom partnerships", "Bring tiagong.sg into Singapore schools and community centres as a heritage learning tool."],
              ["Community meetups", "In-person practice sessions co-hosted with clan associations (huay kuan)."],
            ].map(([title, desc]) => (
              <li key={title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ color: "#C0392B", fontSize: 20, lineHeight: 1.2, flexShrink: 0 }}><ChevronRight size={16} /></span>
                <div>
                  <div style={{ fontWeight: 700, color: "#1A1208", marginBottom: 2, fontSize: 15 }}>{title}</div>
                  <div style={{ color: "#6B5B45", lineHeight: 1.6, fontSize: 14 }}>{desc}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 9. GET IN TOUCH */}
      <div style={{ marginBottom: 64 }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 12, fontWeight: 700, color: "#C0392B", letterSpacing: 3, textTransform: "uppercase", marginBottom: 20 }}>Get In Touch</h2>
        <div style={{ background: "white", borderRadius: 16, padding: "28px 32px", border: "1px solid #F0E8DA", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <p style={{ color: "#6B5B45", fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>
            Email us directly at{" "}
            <a href="mailto:raphaeleeingwi@gmail.com" style={{ color: "#C0392B", fontWeight: 700, textDecoration: "none" }}>raphaeleeingwi@gmail.com</a>
            {" "}— or use one of the prefilled subject lines below:
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[
              {
                label: "General feedback",
                template: `Subject: General feedback on tiagong.sg

Hi Raphael,

I wanted to share some feedback about tiagong.sg:

[Share your thoughts here — what's working well, what could be better, features you'd like to see, etc.]

Thanks for building this platform!

Best regards,
[Your name]`
              },
              {
                label: "Report a translation error",
                template: `Subject: Translation error report

Hi Raphael,

I found a translation issue on tiagong.sg that I wanted to flag:

Dialect: [e.g., Hokkien]
Phrase: [The phrase with the error]
Issue: [Explain what's wrong — incorrect tone, romanization, meaning, etc.]
Suggested correction: [What it should be]

Thanks for keeping the dictionary accurate!

Best regards,
[Your name]`
              },
              {
                label: "Partnership inquiry",
                template: `Subject: Partnership inquiry — tiagong.sg

Hi Raphael,

I'm reaching out to explore a potential partnership with tiagong.sg.

Organization/Background: [Tell us about yourself/your organization]
Partnership idea: [What kind of collaboration are you interested in?]
Why now: [Why does this partnership matter to you?]

I'd love to discuss this further.

Best regards,
[Your name]
[Title/Role]
[Contact info]`
              },
              {
                label: "Dialect Curator application",
                template: `Subject: Dialect Curator application — [Dialect name]

Hi Raphael,

I'd like to help validate [Dialect name] entries on tiagong.sg as a Dialect Curator.

Dialect(s): [Which dialects are you fluent in?]
Background: [How did you learn this dialect? Where are you from? How long have you spoken it?]
Why curator: [What motivated you to volunteer?]
Availability: [How much time could you commit?]

Looking forward to helping preserve our dialect heritage!

Best regards,
[Your name]
[Contact email]`
              }
            ].map(({ label, template }) => {
              const isCopied = aboutCopied === label;
              return (
                <button
                  key={label}
                  onClick={() => {
                    const clipboardText = `To: raphaeleeingwi@gmail.com\n\n${template}`;
                    if (typeof navigator !== "undefined" && navigator.clipboard) {
                      navigator.clipboard.writeText(clipboardText).then(() => {
                        setAboutCopied(label);
                        setTimeout(() => setAboutCopied(c => (c === label ? null : c)), 2000);
                      }).catch(() => {});
                    }
                  }}
                  style={{ display: "inline-block", padding: "8px 14px", borderRadius: 999, background: isCopied ? "#C0392B" : "#FDF6EE", border: `1px solid ${isCopied ? "#C0392B" : "#EDE0CC"}`, color: isCopied ? "#F5E6C8" : "#6B5B45", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background 0.2s, color 0.2s, border-color 0.2s" }}
                >
                  {isCopied ? "Template copied!" : label}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 12, color: "#9B8B75", fontSize: 12, fontStyle: "italic" }}>
            Tip: clicking a button copies the full email template to your clipboard. Fill in the bracketed fields and send to raphaeleeingwi@gmail.com
          </div>
        </div>
      </div>

      {/* 10. MULTI-CTA FOOTER BANNER */}
      <div style={{ background: "linear-gradient(135deg, #1A1208 0%, #2C1810 50%, #3D1F10 100%)", borderRadius: 20, padding: "40px 32px", textAlign: "center", border: "1px solid #3D2A18" }}>
        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 30, fontWeight: 700, color: "#F5E6C8", marginBottom: 10 }}>
          Ready to <em style={{ color: "#C0392B" }}>tiagong</em>?
        </h3>
        <p style={{ color: "#C9B58E", fontSize: 14, marginBottom: 24 }}>
          Pick a path. Every phrase you learn keeps a thread of Singapore alive.
        </p>
        <div className="about-cta-buttons">
          <button onClick={() => router.push("/")} className="btn-primary" style={{ fontSize: 15 }}>Start Learning</button>
          <button onClick={() => router.push("/?screen=network")} className="btn-secondary" style={{ fontSize: 15 }}>Find a Sin Seh</button>
          <button onClick={() => router.push("/associations")} className="btn-secondary" style={{ fontSize: 15 }}>Browse Associations</button>
        </div>
      </div>
    </div>
  );
}
