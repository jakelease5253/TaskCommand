# TaskCommand Brand Guidelines

**Version 1.0** | Last Updated: October 20, 2025

---

## Table of Contents

1. [Brand Overview](#brand-overview)
2. [Logo](#logo)
3. [Color Palette](#color-palette)
4. [Typography](#typography)
5. [UI Components](#ui-components)
6. [Spacing & Layout](#spacing--layout)
7. [Icons & Graphics](#icons--graphics)
8. [Voice & Tone](#voice--tone)

---

## Brand Overview

### Mission
TaskCommand is a robust task management application that serves as an enhanced front-end for Microsoft Planner and other task management platforms. It emphasizes focus, time tracking, and personalized task prioritization.

### Brand Personality
- **Professional** - Reliable and trustworthy productivity tool
- **Focused** - Emphasizes single-task focus mode and deep work
- **Technical** - Command-line aesthetic appeals to power users
- **Efficient** - Streamlined workflows and time tracking

### Target Audience
- Professionals and knowledge workers
- Power users who appreciate technical tools
- Microsoft Planner users seeking enhanced functionality
- Anyone looking for better task focus and time management

---

## Logo

### Primary Logo

The TaskCommand logo consists of two elements:
1. **Icon Badge** - A rounded square with command prompt symbol (`>_`)
2. **Wordmark** - "TaskCommand" in Poppins Bold

**Construction:**
- Icon size: 56px Ã— 56px (scales proportionally)
- Border radius: 12px (scales proportionally at 21.4% of icon size)
- Gap between icon and text: 14px
- Text size: 32px (scales proportionally)

**Icon Details:**
- Background: Linear gradient 135Â° from `#3b82f6` to `#2563eb`
- Symbol: `>_` in white, Fira Code Medium, 30px (scales proportionally)
- Drop shadow: `0 4px 12px rgba(0,0,0,0.15)`

### Logo Variations

**Horizontal Layout** (Primary)
```
[Icon] TaskCommand
```
Use for: Headers, marketing materials, general use

**Icon Only**
```
[Icon]
```
Use for: App icons, favicons, small spaces where text isn't legible

**Monochrome Versions**
- All white (for dark backgrounds)
- All dark gray `#0f172a` (for light backgrounds)
- Use when color reproduction isn't possible

### Clear Space
Maintain clear space around the logo equal to the height of the icon badge on all sides.

### Minimum Sizes
- Horizontal logo: Minimum 120px width
- Icon only: Minimum 24px Ã— 24px

### Logo Don'ts
- âŒ Don't change the gradient colors
- âŒ Don't rotate or skew the logo
- âŒ Don't add effects (shadows, glows, outlines) beyond specified
- âŒ Don't place on busy backgrounds without sufficient contrast
- âŒ Don't change the font or spacing

---

## Color Palette

### Primary Colors

**Primary Gradient**
- Start: `#3b82f6` (RGB: 59, 130, 246)
- End: `#2563eb` (RGB: 37, 99, 235)
- Gradient angle: 135Â°

Usage: Logo, primary buttons, focus indicators, active states

**Accent Color (Success)**
- Hex: `#10b981`
- RGB: 16, 185, 129

Usage: Success states, completed tasks, positive actions

### Text Colors

**Primary Text**
- Hex: `#0f172a`
- RGB: 15, 23, 42

Usage: Headings, primary body text, important content

**Secondary Text**
- Hex: `#475569`
- RGB: 71, 85, 105

Usage: Supporting text, metadata, timestamps, captions

**Tertiary Text**
- Hex: `#94a3b8`
- RGB: 148, 163, 184

Usage: Placeholders, disabled states, very low emphasis

### Background Colors

**Primary Background**
- Hex: `#ffffff`
- RGB: 255, 255, 255

Usage: Main background, cards, primary surfaces

**Secondary Background**
- Hex: `#f8fafc`
- RGB: 248, 250, 252

Usage: Page background, subtle surfaces, alternate sections

**Tertiary Background**
- Hex: `#f1f5f9`
- RGB: 241, 245, 249

Usage: Hover states, input backgrounds, very subtle differentiation

### Border Colors

**Default Border**
- Hex: `#e2e8f0`
- RGB: 226, 232, 240

Usage: Standard borders, dividers, separators

**Subtle Border**
- Hex: `#cbd5e0`
- RGB: 203, 213, 224

Usage: Checkboxes, input borders, less prominent dividers

### State Colors

**Error/High Priority**
- Hex: `#f56565`
- RGB: 245, 101, 101

Usage: Error messages, high priority indicators, destructive actions

**Warning/Medium Priority**
- Hex: `#ed8936`
- RGB: 237, 137, 54

Usage: Warnings, medium priority indicators, cautionary states

**Info**
- Hex: `#4299e1`
- RGB: 66, 153, 225

Usage: Information messages, notifications, general highlights

### CSS Variables

```css
:root {
  /* Primary */
  --primary-start: #3b82f6;
  --primary-end: #2563eb;
  --primary-gradient: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  
  /* Accent */
  --accent: #10b981;
  
  /* Text */
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-tertiary: #94a3b8;
  
  /* Backgrounds */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  
  /* Borders */
  --border-default: #e2e8f0;
  --border-subtle: #cbd5e0;
  
  /* States */
  --error: #f56565;
  --warning: #ed8936;
  --success: #10b981;
  --info: #4299e1;
}
```

---

## Typography

### Font Families

**Primary Font: Poppins**
- Source: Google Fonts
- Weights used: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
- Usage: All UI text, headings, body copy, buttons

**Monospace Font: Fira Code**
- Source: Google Fonts
- Weights used: 400 (Regular), 500 (Medium)
- Usage: Command prompt icon, timers, code snippets, technical displays

### Font Import

```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
```

### Type Scale

**Display**
- Size: 48px / 3rem
- Weight: 700 (Bold)
- Line height: 1.2
- Usage: Hero headings, marketing materials

**Heading 1**
- Size: 32px / 2rem
- Weight: 700 (Bold)
- Line height: 1.3
- Usage: Page titles, major sections

**Heading 2**
- Size: 24px / 1.5rem
- Weight: 600 (SemiBold)
- Line height: 1.4
- Usage: Section headings, card titles

**Heading 3**
- Size: 18px / 1.125rem
- Weight: 600 (SemiBold)
- Line height: 1.4
- Usage: Subsection headings, task titles

**Body Large**
- Size: 16px / 1rem
- Weight: 400 (Regular)
- Line height: 1.6
- Usage: Primary body text, descriptions

**Body**
- Size: 14px / 0.875rem
- Weight: 400 (Regular)
- Line height: 1.6
- Usage: Default body text, most UI text

**Body Small**
- Size: 12px / 0.75rem
- Weight: 400 (Regular)
- Line height: 1.5
- Usage: Captions, timestamps, metadata

**Label**
- Size: 14px / 0.875rem
- Weight: 500 (Medium)
- Line height: 1.4
- Usage: Form labels, button text, UI labels

**Label Small**
- Size: 12px / 0.75rem
- Weight: 500 (Medium)
- Line height: 1.4
- Usage: Small labels, badges, tags

**Monospace (Timer/Code)**
- Size: 14px / 0.875rem
- Weight: 500 (Medium)
- Line height: 1.4
- Font: Fira Code
- Usage: Timers, timestamps in focus mode

### CSS Typography Classes

```css
/* Display */
.text-display {
  font-family: 'Poppins', sans-serif;
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.2;
}

/* Headings */
.text-h1 {
  font-family: 'Poppins', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.3;
}

.text-h2 {
  font-family: 'Poppins', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.4;
}

.text-h3 {
  font-family: 'Poppins', sans-serif;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.4;
}

/* Body */
.text-body-lg {
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.6;
}

.text-body {
  font-family: 'Poppins', sans-serif;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.6;
}

.text-body-sm {
  font-family: 'Poppins', sans-serif;
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.5;
}

/* Labels */
.text-label {
  font-family: 'Poppins', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.4;
}

.text-label-sm {
  font-family: 'Poppins', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.4;
}

/* Monospace */
.text-mono {
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.4;
}
```

---

## UI Components

### Buttons

**Primary Button**
- Background: Primary gradient
- Text: White, Poppins Medium, 14px
- Padding: 10px 20px
- Border radius: 8px
- Hover: Add shadow `0 4px 12px rgba(59, 130, 246, 0.4)`
- Active: Slightly darker gradient

```css
.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  font-family: 'Poppins', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}
```

**Secondary Button**
- Background: White
- Text: Primary text color, Poppins Medium, 14px
- Padding: 10px 20px
- Border: 1px solid `#e2e8f0`
- Border radius: 8px
- Hover: Background `#f8fafc`

**Ghost Button**
- Background: Transparent
- Text: Primary gradient color or primary text
- Padding: 10px 20px
- Border: None
- Border radius: 8px
- Hover: Background `#f1f5f9`

**Icon Button**
- Size: 36px Ã— 36px
- Background: Transparent or subtle background
- Border radius: 8px
- Icon size: 18px
- Hover: Background `#f1f5f9`

### Cards

**Standard Card**
- Background: White
- Border radius: 12px
- Padding: 20px
- Border: 1px solid `#e2e8f0`
- Shadow: `0 2px 8px rgba(0,0,0,0.04)`

**Focus Card** (for focused task)
- Background: White
- Border radius: 12px
- Padding: 20px
- Border: 2px solid `#3b82f6`
- Shadow: `0 0 0 4px rgba(59, 130, 246, 0.1)`

### Input Fields

**Text Input**
- Background: `#f8fafc`
- Border: 1px solid `#e2e8f0`
- Border radius: 8px
- Padding: 10px 14px
- Font: Poppins Regular, 14px
- Focus: Border color `#3b82f6`, background white

**Checkbox**
- Size: 20px Ã— 20px
- Border: 2px solid `#cbd5e0`
- Border radius: 6px
- Checked: Background primary gradient, white checkmark

### Badges & Tags

**Focus Badge**
- Background: Primary gradient
- Text: White, Poppins SemiBold, 11px
- Padding: 4px 10px
- Border radius: 6px
- Text transform: Uppercase
- Letter spacing: 0.5px

**Priority Badges**
- Size: 6px Ã— 6px circle
- High: `#f56565`
- Medium: `#ed8936`
- Low: `#10b981`

**Status Tags**
- Background: Light color variant
- Text: Dark color variant, Poppins Medium, 12px
- Padding: 4px 8px
- Border radius: 4px

### Timers

**Timer Display**
- Font: Fira Code Medium, 14px
- Color: Primary gradient color or primary text
- Background: `#f1f5f9`
- Padding: 8px 12px
- Border radius: 8px
- Format: `HH:MM:SS` or `--:--:--` for untracked

---

## Spacing & Layout

### Spacing Scale

TaskCommand uses an 8px base spacing unit:

```css
--space-1: 4px;   /* 0.25rem */
--space-2: 8px;   /* 0.5rem */
--space-3: 12px;  /* 0.75rem */
--space-4: 16px;  /* 1rem */
--space-5: 20px;  /* 1.25rem */
--space-6: 24px;  /* 1.5rem */
--space-8: 32px;  /* 2rem */
--space-10: 40px; /* 2.5rem */
--space-12: 48px; /* 3rem */
--space-16: 64px; /* 4rem */
```

### Component Spacing Guidelines

- **Card padding:** 20px (space-5)
- **Button padding:** 10px 20px (space-3 space-5)
- **Input padding:** 10px 14px (space-3 space-4)
- **Gap between elements:** 12px - 16px (space-3 to space-4)
- **Section spacing:** 24px - 32px (space-6 to space-8)
- **Page margins:** 40px (space-10)

### Border Radius Scale

```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

### Shadow Scale

```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
--shadow-md: 0 2px 8px rgba(0,0,0,0.04);
--shadow-lg: 0 4px 12px rgba(0,0,0,0.08);
--shadow-xl: 0 8px 24px rgba(0,0,0,0.12);
--shadow-focus: 0 0 0 4px rgba(59, 130, 246, 0.1);
```

---

## Icons & Graphics

### Icon Style
- Use outline style icons (not filled)
- Stroke width: 2px
- Size: 18px, 20px, or 24px depending on context
- Color: Match text color or use primary gradient for emphasis

### Recommended Icon Libraries
- [Lucide Icons](https://lucide.dev/) - Preferred
- [Heroicons](https://heroicons.com/) - Alternative
- [Feather Icons](https://feathericons.com/) - Alternative

### Icon Usage Guidelines
- Use sparingly - only when they add clarity
- Always pair with text labels except for universally understood icons
- Maintain consistent sizing within the same context
- Use primary gradient color for icons in active/focused states

---

## Voice & Tone

### Brand Voice
TaskCommand communicates with:
- **Clarity** - Straightforward, no jargon unless technical context requires it
- **Confidence** - Knowledgeable and capable without being arrogant
- **Efficiency** - Concise and action-oriented
- **Helpfulness** - Supportive and guiding without being condescending

### Writing Style
- Use active voice
- Keep sentences short and scannable
- Use second person ("you") for instructions
- Be direct: "Add task" not "You can add a task if you'd like"
- Avoid unnecessary pleasantries in UI copy

### Terminology
- **Task** (not "item" or "to-do")
- **Focus Mode** (not "focused task" or "current task")
- **Timer** (not "stopwatch" or "clock")
- **Priority** (not "importance")
- **Complete** (not "finish" or "done" as a verb)

### Example UI Copy

**Good:**
- "Add task"
- "Set as focus"
- "Start timer"
- "No tasks yet. Create your first task to get started."

**Avoid:**
- "Would you like to add a new task?"
- "Focus on this task"
- "Begin timing"
- "Oops! Looks like you don't have any tasks here yet!"

---

## File Exports & Assets

### Logo Files Needed
- SVG (vector, scalable for all sizes)
- PNG (512Ã—512px for app icon)
- PNG (256Ã—256px for general use)
- PNG (64Ã—64px for small UI elements)
- PNG (32Ã—32px for favicon)
- ICO (16Ã—16px, 32Ã—32px multi-size favicon)

### Brand Colors Export Formats
- CSS variables (provided above)
- Sass/SCSS variables
- Tailwind config
- Design tool swatches (Figma, Sketch, Adobe)

---

## Version History

**v1.0** - October 20, 2025
- Initial brand guidelines created
- Logo concept finalized (Concept 1: Command Prompt)
- Blue gradient color palette selected
- Poppins + Fira Code typography established
- Core UI components defined

---

## Questions or Updates?

This is a living document. As TaskCommand evolves, these guidelines should be updated to reflect new decisions and learnings.

For questions about brand usage or to suggest updates, refer to the project documentation or contact the project owner.

---

**TaskCommand** - Focus. Track. Command your tasks.
