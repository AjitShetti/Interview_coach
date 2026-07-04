Design System — VoiceCoach
A voice-first interview preparation platform. The design should feel like a tool built by engineers who care about craft — not a marketing site. Quiet confidence. No noise.
Philosophy
The product is high-stakes. People use this before the most nerve-wracking moments of their career. The design should feel like a calm, competent mentor — not a cheerful chatbot.


Restraint over decoration. Every element earns its place.

Typography does the heavy lifting. Layout and type carry the design. Color is secondary.

Warmth inside discipline. Dark surfaces, cream text — serious but not cold.

Functional motion only. Nothing animates for fun. Everything animates for clarity.
Color
Background       #0D0D0D      Near-black. Not pure black — has warmth.
Surface          #141414      Cards, panels, editor backgrounds.
Surface Raised   #1C1C1C      Hover states, modals, dropdowns.
Border           #2A2A2A      Dividers, input outlines, card edges.
Border Subtle    #1E1E1E      Section separators, very quiet lines.

Primary Text     #F0EBE1      Warm cream. Not white — white feels harsh.
Secondary Text   #8A8277      Muted warm gray. Metadata, labels, captions.
Disabled Text    #4A4744      Placeholder text, inactive states.

Accent           #D4A853      Amber-gold. Used sparingly — CTAs, active states, highlights.
Accent Hover     #C49840      Darkened amber on hover.
Accent Subtle    #2A2215      Background tint for accent elements.

Success          #4A9B6F      Correct output, passing tests.
Error            #B85C5C      Failed execution, wrong answers.
Warning          #A87B3A      Time warnings, edge case alerts.

Code Surface     #111111      Monaco editor background.
Code Border      #252525      Editor panel border.

Rule: The accent color appears in at most 2–3 places per screen. If it's everywhere, it means nothing.
Typography
Display Font     "Instrument Serif"    (Google Fonts)
                 Headings, hero text, section titles.
                 Italic variant for emphasis — feels editorial, not aggressive.

Body Font        "DM Sans"             (Google Fonts)
                 All body copy, UI labels, navigation.
                 Regular 400 and Medium 500 only. Never bold body text.

Mono Font        "JetBrains Mono"      (Google Fonts)
                 Code editor, terminal output, file paths, version strings.
                 Also used for numeric data — timestamps, scores, test counts.

Scale
Display          72px / 1.05 line-height / Instrument Serif
                 Hero headline only. One per page.

Heading 1        48px / 1.1  / Instrument Serif
Heading 2        32px / 1.2  / Instrument Serif
Heading 3        22px / 1.3  / DM Sans Medium

Body Large       18px / 1.7  / DM Sans Regular    ← hero subtext, feature descriptions
Body             16px / 1.65 / DM Sans Regular    ← general copy
Body Small       14px / 1.6  / DM Sans Regular    ← captions, metadata, labels

Mono Large       16px / 1.5  / JetBrains Mono     ← code in editor
Mono Small       13px / 1.5  / JetBrains Mono     ← inline code snippets, tags

Rule: Never use more than 3 type sizes in a single section. Hierarchy comes from size contrast, not weight contrast.
Spacing
Built on an 8px base unit.
4px    xs      Tight inline gaps (icon to label, tag padding vertical)
8px    sm      Component internal padding, small gaps
16px   md      Card padding, form field gaps
24px   lg      Section internal spacing
32px   xl      Between components in a section
48px   2xl     Section top/bottom padding on mobile
64px   3xl     Section top/bottom padding on desktop
96px   4xl     Hero section vertical padding
128px  5xl     Between major page sections

Rule: Sections breathe. 96–128px vertical gaps between landing page sections. Cramped layouts feel cheap.
Layout
Max Width        1120px       Content container
Gutter           24px         Mobile
                 48px         Desktop
Grid             12 columns   Standard
                 Gaps: 24px

Section Patterns
Hero Full-width. Centered or left-aligned text. No card, no box. Text directly on dark background. Badge above headline (small mono text: e.g. // v1.0 · AI-Powered). CTA button below subtext with subtle spacing.
Feature Grid 3-column on desktop, 1-column on mobile. Cards with 1px border on #2A2A2A, 16px padding, 8px border-radius. Icon (20px, amber) at top. Title in Heading 3. Body in Body Small, secondary color.
How It Works Horizontal step list on desktop. Each step: number in mono font (amber), title in Heading 3, description in Body. Connected by a thin horizontal rule (#2A2A2A). No boxes, no cards — just type and line.
CTA Section Centered. Dark surface card (#141414) with subtle border. Single headline. One button. No more than two lines of supporting text.
Components
Button — Primary
Background       #D4A853
Text             #0D0D0D        (dark text on amber background)
Font             DM Sans Medium, 15px
Padding          12px 24px
Border Radius    6px
Hover            background → #C49840, slight upward translate (-1px)
Active           background → #B8882E, translate(0)
Transition       150ms ease

Button — Ghost
Background       transparent
Border           1px solid #2A2A2A
Text             #F0EBE1
Font             DM Sans Medium, 15px
Padding          12px 24px
Border Radius    6px
Hover            border → #4A4744, background → #1C1C1C

Input Field
Background       #141414
Border           1px solid #2A2A2A
Text             #F0EBE1
Placeholder      #4A4744
Font             DM Sans Regular, 15px
Padding          12px 16px
Border Radius    6px
Focus            border → #D4A853, no box-shadow glow (glow is cheap)

Card
Background       #141414
Border           1px solid #2A2A2A
Border Radius    8px
Padding          24px
Hover            border → #3A3A3A, background → #181818
Transition       150ms ease

Code Editor Panel
Background       #111111
Border           1px solid #252525
Border Radius    8px
Header bar       #161616 with filename in mono, 13px, secondary color
Run button       Ghost style, right-aligned in header
Output panel     Below editor, separated by border. Mono font, 13px.
Success output   #4A9B6F
Error output     #B85C5C

Badge / Tag
Background       #2A2215        (amber-tinted dark)
Text             #D4A853
Font             JetBrains Mono, 12px
Padding          4px 10px
Border Radius    4px
Border           1px solid #3A3015

Motion
Keep it minimal. Every animation has a functional reason.
Page load        Fade in + translate Y(12px → 0) on hero text
                 Staggered: headline → subtext → CTA
                 Duration: 400ms, ease-out
                 Delay between elements: 80ms

Scroll reveals   Sections fade in as they enter viewport (IntersectionObserver)
                 translate Y(20px → 0), opacity 0 → 1
                 Duration: 350ms, ease-out

Hover states     150ms ease. Never bounce, never spring.

Button click     Scale(0.98) on active. 80ms. That's it.

No              Parallax scrolling
No              Gradient chasing / color shift animations
No              Continuous loops or spinners on static pages
No              Text scramble effects (overused)

Iconography
Use Lucide React exclusively. Stroke width: 1.5px. Size: 20px in UI, 18px in compact contexts. Color: inherit from parent or #8A8277 (secondary).
Never fill icons. Never mix icon libraries.
Landing Page — Section Order
1. Nav              Logo left. Links center. "Sign In" ghost + "Get Started" primary right.
                    No hamburger on desktop. Sticky with backdrop-blur on scroll.

2. Hero             Badge → Headline (Display) → Subtext (Body Large) → CTA pair
                    Optional: faint grid or dot pattern in background — very subtle, 4% opacity

3. Social Proof     One line. "Used by engineers preparing for Google, Stripe, and Atlassian."
                    No logos yet — text only is more honest than fake logo rows.

4. How It Works     3 steps. Horizontal on desktop.

5. Features         3-column card grid.

6. Code Editor Preview    
                    Full-width dark panel showing Monaco + output.
                    Static screenshot or live embedded component.
                    Caption below in mono: "// Run your code. Get feedback. Ship faster."

7. CTA Section      "Ready to stop winging it?" → Get Started button.

8. Footer           Logo + copyright left. Links right. Minimal.

Do Not


No gradients on text (ever)

No purple, no teal, no neon — this is not a crypto product

No rounded corners above 8px — softness undermines the serious tone

No stock illustrations, no cartoon characters, no undraw.co assets

No box-shadow on cards — use border instead

No font-weight: 700 on body copy

No full-width buttons unless on mobile

No emoji in UI copy
Voice & Copy Tone
Headlines: Direct. Outcome-first. No exclamation marks.
✓ "Practice interviews that actually prepare you." ✗ "Supercharge your interview prep with AI!"
Body copy: One idea per sentence. Short paragraphs. No marketing speak.
✓ "Answer questions out loud. Get feedback on your pacing, clarity, and content." ✗ "Our cutting-edge AI-powered voice analysis provides comprehensive real-time insights."
CTAs: Verb-first. Specific.
✓ "Start a mock interview" / "Try the code editor" ✗ "Get started today!" / "Learn more"