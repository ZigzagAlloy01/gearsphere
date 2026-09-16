## Team Quotes
* "You don't need to figure it all at once, let the problem teach you as you go." - Toyin Ajiboye
* "Nothing is impossible with God." - Michael Tatani Kazembe
* "Persistence is the key, if your mind can conceive it, you can achieve it". - Attah Collins 
* "Pride has the power to hinder our progress as nothing else can." - Ivan Salamanca

## GearSphere Design System

The GearSphere design system provides a consistent visual language across the application. All team members should follow these standards when creating or modifying UI components.

### Colors

| Token         | Hex       | Usage                                        |
| ------------- | --------- | -------------------------------------------- |
| **Primary**   | `#166534` | Main brand color and primary actions         |
| **Secondary** | `#334155` | Supporting UI and secondary elements         |
| **Accent**    | `#F59E0B` | Highlights, attention, and featured elements |

#### Color Usage

* **Primary** — Main actions such as **Sign Up**, **List Item**, **Save**, and primary branding.
* **Secondary** — Supporting elements such as secondary actions, navigation, and supporting content.
* **Accent** — Highlights and attention areas such as **Featured**, **Rent Now**, ratings, and important callouts.
* Use Tailwind's `slate`/`neutral` colors for general backgrounds, borders, and text.
* Do not introduce new brand colors without team agreement.

#### Tailwind Usage

Use the theme tokens rather than hard-coded hex values:

```tsx
<button className="bg-primary text-white">
  Rent Now
</button>

<h2 className="text-secondary">
  Available Equipment
</h2>

<span className="bg-accent text-white">
  Featured
</span>
```

Avoid:

```tsx
<button className="bg-[#166534]">
  Rent Now
</button>
```

---

### Typography

**Font:** Inter

GearSphere uses **Inter** as its primary typeface throughout the application.

| Element                | Tailwind Class           | Size | Weight | Usage                      |
| ---------------------- | ------------------------ | ---: | -----: | -------------------------- |
| **Page Title**         | `text-3xl font-bold`     | 30px |    700 | Main page headings         |
| **Section Heading**    | `text-2xl font-semibold` | 24px |    600 | Major sections             |
| **Subheading**         | `text-xl font-semibold`  | 20px |    600 | Smaller sections and cards |
| **Body**               | `text-base`              | 16px |    400 | Normal content             |
| **Supporting Text**    | `text-sm`                | 14px |    400 | Supporting information     |
| **Caption / Metadata** | `text-xs`                | 12px |    400 | Metadata and helper text   |

#### Font Weights

| Weight | Tailwind Class  | Usage              |
| -----: | --------------- | ------------------ |
|    400 | `font-normal`   | Body text          |
|    500 | `font-medium`   | Labels and buttons |
|    600 | `font-semibold` | Section headings   |
|    700 | `font-bold`     | Page titles        |

#### Text Colors

| Tailwind Class   | Usage           |
| ---------------- | --------------- |
| `text-slate-900` | Primary text    |
| `text-slate-600` | Secondary text  |
| `text-slate-500` | Supporting text |
| `text-slate-400` | Muted text      |

#### Typography Guidelines

* Use **Inter** throughout the application.
* Use Tailwind typography classes rather

### GearSphere Dashboard

┌─────────────────────────────────────────────────────────┐
│ GearSphere     Dashboard  Browse  My Listings  Profile  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Welcome back, user!                                    │
│  Here's your current GearSphere account.                │
│                                                         │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌────────┐   │
│  │ Listings  │ │ Requests  │ │ Rentals   │ │Messages│   │
│  │    5      │ │    3      │ │    2      │ │   4    │   │
│  └───────────┘ └───────────┘ └───────────┘ └────────┘   │
│                                                         │
│  Quick Actions                                          │
│  [+ List Equipment]  [Browse Equipment]                 │
│                                                         │
│  My Listings                         Recent Activity    │
│  ┌────────────────────────┐          ┌───────────────┐  │
│  │ Power Drill   Active   │          │ New request   │  │
│  │ Generator     Rented   │          │ Rental agreed │  │
│  │ Welder        Active   │          │ New message   │  │
│  └────────────────────────┘          └───────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
