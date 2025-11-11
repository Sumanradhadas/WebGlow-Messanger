# WebGlow Personal Messenger - Design Guidelines

## Design Approach
**Reference-Based Approach**: WhatsApp as primary design reference for messaging interface, Linear for admin panel aesthetics, with custom dark navy theme implementation.

## Core Design Principles
1. **Real-time Feedback**: Every user action has immediate visual response
2. **Conversation-Centric**: Chat interface is the hero - minimal distractions
3. **Professional Dark Aesthetic**: Modern, glowing accents on dark navy foundation
4. **Mobile-First PWA**: Touch-optimized, installable, works offline

---

## Color System

### Base Colors
- **Background**: `#0A0F23` (dark navy/black)
- **User Bubble**: `#1E2A50` (dark navy)
- **Admin Bubble**: `#0E4C92` (electric blue)
- **Text**: `#E0E0E0` (light gray)
- **Accent Glow**: `#00BFFF` (cyan-blue)
- **Borders/Dividers**: `#1A2342` (subtle navy)
- **Input Fields**: `#151D3B` (slightly lighter than background)

### Functional Colors
- **Success/Online**: `#00D9A3`
- **Error/Offline**: `#FF4757`
- **Warning**: `#FFA502`
- **Read Receipt**: `#00BFFF` (accent glow)

---

## Typography

**Font Stack**: Inter (primary), Poppins (headings), Roboto (fallback)

### Scale
- **H1 (Admin Panel)**: 28px, semi-bold
- **H2 (Section Headers)**: 20px, medium
- **Body (Messages)**: 15px, regular
- **Small (Timestamps)**: 12px, regular
- **Tiny (Status)**: 11px, regular

### Message Bubble Text
- User messages: 15px, `#E0E0E0`
- Timestamps: 11px, `#8B92A8`, right-aligned below bubble
- Read receipts: 11px with double checkmark icon

---

## Layout System

**Tailwind Spacing Units**: Primarily use `2, 4, 6, 8, 12, 16` for consistent rhythm

### Client Chat View
- **Full-screen layout**: No traditional header/footer chrome
- **Top Bar** (fixed): 60px height, contains recipient name/status, back button
- **Messages Area**: Flex-grow scrollable container with padding `p-4`
- **Input Bar** (fixed bottom): 70px height, contains text input, emoji button, attachment button, send button

### Admin Panel
- **Sidebar** (240px): Client list with search, scrollable
- **Main Chat**: Same as client view but with client details header
- **Client Info Panel** (collapsible, 300px): User details, media gallery

---

## Component Specifications

### Chat Bubbles
- **Border Radius**: `16px 16px 4px 16px` (user, outgoing right)
- **Border Radius**: `16px 16px 16px 4px` (admin, incoming left)
- **Max Width**: `75%` on desktop, `85%` on mobile
- **Padding**: `12px 16px`
- **Margin Between**: `8px` vertical
- **Shadow**: `0 2px 8px rgba(0, 191, 255, 0.1)` on admin bubbles

### Message Input
- **Height**: 48px expandable to 120px (multi-line)
- **Border Radius**: `24px`
- **Background**: `#151D3B`
- **Border**: `1px solid #1A2342`, focus: `1px solid #00BFFF`
- **Padding**: `12px 20px`

### Buttons
- **Send Button**: 48px circle, background `#0E4C92`, icon white
- **Attachment/Emoji**: 40px circle, background transparent, hover `#1E2A50`
- **Border Radius**: Full circle for icon buttons
- **Glow on Hover**: `box-shadow: 0 0 20px rgba(0, 191, 255, 0.4)`

### Admin Panel - Client Cards
- **Height**: 72px
- **Background**: `#151D3B`, active: `#1E2A50`
- **Border Left**: `3px solid transparent`, unread: `3px solid #00BFFF`
- **Padding**: `12px 16px`
- **Layout**: Avatar (40px) + Name/Last Message (flex-grow) + Timestamp/Badge

---

## Animations

### Message Entrance
```
Slide in from right (user) or left (admin)
Duration: 200ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)
```

### Typing Indicator
- Three animated dots bouncing sequentially
- Each dot: 8px circle, `#00BFFF`
- Animation loop: 1.4s

### Button Interactions
- **Send Button Pulse**: When message typed, subtle scale pulse (1.0 to 1.05) every 2s
- **Hover Glow**: 150ms transition to glowing shadow
- **Click**: Scale to 0.95 momentarily

### Loading States
- Shimmer effect on client cards while loading
- Spinner: Rotating cyan ring, 24px

---

## Special Features

### Emoji Picker
- Positioned above input, 320px × 400px
- Dark theme: background `#151D3B`, border `#1A2342`
- Categories horizontally scrollable at top

### Media Preview
- Images: Max 240px width in chat, lightbox on click
- Files: Card with icon, filename, size (120px height)
- Background: `#1E2A50`, border radius `12px`

### Typing Indicator
- Appears in message area as incoming bubble
- Light gray background `#1A2342`
- Three dots animation

### Read Receipts
- Single gray checkmark: Sent
- Double gray checkmark: Delivered
- Double cyan checkmark: Read (`#00BFFF`)
- 14px icons, positioned bottom-right of bubble

---

## Mobile Optimizations

- **Touch Targets**: Minimum 44px × 44px
- **Input Focus**: Zoom disabled (`user-scalable=no`)
- **Safe Areas**: Respect notch/home indicator with padding
- **Scroll Behavior**: Smooth scrolling with momentum
- **Pull-to-Refresh**: Custom styling matching theme

---

## PWA Elements

### Splash Screen
- Background: `#0A0F23`
- Logo: WebGlow logo centered, white/cyan gradient
- Tagline: "Personal Messenger" below logo

### App Icon
- 512×512px with rounded corners
- Dark navy background with glowing "W" monogram
- Cyan accent glow effect

---

## Accessibility

- **Focus Indicators**: 2px cyan outline on keyboard navigation
- **Contrast Ratios**: All text meets WCAG AA (minimum 4.5:1)
- **Screen Reader**: Semantic HTML, ARIA labels on icons
- **Reduced Motion**: Respect `prefers-reduced-motion` for animations

---

This design creates a premium, professional messaging experience with WhatsApp familiarity, elevated by the distinctive dark navy aesthetic and glowing accents that align with the WebGlow brand.