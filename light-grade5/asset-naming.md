This is actually a very good asset organization, and I would standardize this across all applets. Since we're building developer-ready documentation, I would include an **Asset Manifest** as part of the Content Flow/PRD so developers know exactly what assets are expected before implementation.

For this applet, I'd document it like this:

# Asset Structure

```text
assets/
│
├── room-assets/
│   ├── home-image.png
│   ├── dark-bg-room.png
│   ├── light-bg-room.png
│   └── light.png
│
├── light-produce/
│   ├── 1sun.png
│   ├── 1bulb.png
│   ├── 1candle.png
│   ├── 1fire.png
│   ├── 1light-insect.png
│   ├── 1torch.png
│   └── 1tree.png
│
└── no-light-produce/
    ├── 2book.png
    ├── 2ball.png
    ├── 2mirror.png
    ├── 2moon.png
    ├── 2pencil.png
    └── 2scissors.png
```

---

# Asset Usage by Screen

| Screen | Assets Required                                           |
| ------ | --------------------------------------------------------- |
| 1      | home-image.png                                            |
| 2–7    | dark-bg-room.png, light-bg-room.png, light.png            |
| 4–6    | flashlight, cat, room assets                              |
| 7      | Brightness slider                                         |
| 8–9    | All objects from `light-produce/` and `no-light-produce/` |
| 10–16  | light.png, transparent sheet, cardboard, room background  |
| 17–18  | glass, butter paper, wooden board                         |

---

# Object Classification

## Produces Light

| Asset             | Category |
| ----------------- | -------- |
| 1sun.png          | Luminous |
| 1bulb.png         | Luminous |
| 1candle.png       | Luminous |
| 1fire.png         | Luminous |
| 1light-insect.png | Luminous |
| 1torch.png        | Luminous |

---

## Does Not Produce Light

| Asset         | Category     |
| ------------- | ------------ |
| 2book.png     | Non-luminous |
| 2ball.png     | Non-luminous |
| 2mirror.png   | Non-luminous |
| 2moon.png     | Non-luminous |
| 2pencil.png   | Non-luminous |
| 2scissors.png | Non-luminous |
| 1tree.png     | Non-luminous |

> **Note:** Although `1tree.png` is currently stored in the `light-produce` folder, conceptually it is a **non-luminous object** and should be moved to the `no-light-produce` folder (or the developer should classify it as non-luminous in the data configuration).

---

# Suggested Asset Convention (for all future applets)

Rather than hardcoding asset names in components, maintain a simple configuration file.

Example:

```json
{
  "luminous": [
    "sun",
    "bulb",
    "candle",
    "fire",
    "firefly",
    "torch"
  ],
  "nonLuminous": [
    "book",
    "ball",
    "mirror",
    "moon",
    "tree",
    "pencil",
    "scissors"
  ]
}
```

Then every drag-and-drop activity, quiz, or tap interaction can read from this configuration instead of embedding the logic in code. This makes the applet scalable and reusable for future topics.

I also recommend adding an **Asset Manifest** section to every PRD, alongside the Content Flow and Screen Flow, so the engineering team knows exactly:

* which assets are required,
* where they're stored,
* which screen uses them,
* and how each asset behaves (static, draggable, animated, toggleable, etc.). This eliminates guesswork during implementation.

