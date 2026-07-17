/* global window */
/* Content + configuration for "Light and Its Properties" (Grade 5, Applet 1). */

// Data-driven object config (per asset-naming.md — no hardcoded names in components).
// Paths are resolved by components; `label` is the visible name; `type` drives behaviour.
window.LIGHT_CONFIG = {
  // Luminous = produces its own light.
  luminous: [
    { id: 'sun',    label: 'Sun',      src: 'assets/light-produce/1sun.png' },
    { id: 'bulb',   label: 'Bulb',     src: 'assets/light-produce/1bulb.png' },
    { id: 'candle', label: 'Candle',   src: 'assets/light-produce/1candle.png' },
    { id: 'fire',   label: 'Fire',     src: 'assets/light-produce/1fire.png' },
    { id: 'firefly',label: 'Firefly',  src: 'assets/light-produce/1light-insect.png' },
    { id: 'torch',  label: 'Torch',    src: 'assets/light-produce/1torch.png' },
  ],
  // Non-luminous = does not produce light. NOTE: 1tree.png lives in light-produce/
  // but is conceptually non-luminous (per asset-naming.md) — classified here.
  nonLuminous: [
    { id: 'book',    label: 'Book',    src: 'assets/no-light-produce/2book.png' },
    { id: 'ball',    label: 'Ball',    src: 'assets/no-light-produce/2ball.png' },
    { id: 'mirror',  label: 'Mirror',  src: 'assets/no-light-produce/2mirror.png' },
    { id: 'moon',    label: 'Moon',    src: 'assets/no-light-produce/2moon.png' },
    { id: 'pencil',  label: 'Pencil',  src: 'assets/no-light-produce/2pencil.png' },
    { id: 'scissors',label: 'Scissors',src: 'assets/no-light-produce/2scissors.png' },
    { id: 'tree',    label: 'Tree',    src: 'assets/light-produce/1tree.png' },
  ],
  // S17-18 compare materials. No PNGs present yet -> rendered as CSS/SVG placeholders.
  // If PNGs are added to assets/, set `src` here and the component will use it.
  materials: [
    { id: 'glass',        label: 'Glass',        type: 'transparent', pass: 1.0,  src: null },
    { id: 'butter-paper', label: 'Butter paper', type: 'translucent', pass: 0.45, src: null },
    { id: 'wood',         label: 'Wooden board', type: 'opaque',      pass: 0.0,  src: null },
  ],
  rooms: {
    dark:  'assets/room-assets/dark-bg-room.png',
    light: 'assets/room-assets/light-bg-room.png',
    empty: 'assets/room-assets/emptyroom.png',
    home:  'assets/room-assets/home-image.png',
    flashlight: 'assets/room-assets/light.png',
    bulb:  'assets/light-produce/1bulb.png',
  },
};

const appData = {
  en: {
    'standard-ui': {
      buttons: {
        next: 'Next',
        finish: 'Finish',
        try_again: 'Try Again',
      },
    },
    'content-ui': {
      properties: {
        p1: '1. Light always travels in a straight line.',
        p2: '2. Light passes through transparent materials.',
        p3: '3. A shadow is formed when an opaque object blocks the path of light.',
      },
      screens: {
        1: {
          title: "Let's explore the fascinating world of light!",
          instruction: 'Choose a topic to begin.',
          optionA: 'Light and Its Properties',
          optionB: 'Reflection of Light and Laws of Reflection',
        },
        2: {
          title: 'Can you find the cat in the dark?',
          instruction: 'Look carefully and tap where you think the cat is.',
        },
        3: {
          title: 'It is difficult to see in the dark. What happens when light is switched on?',
          instruction: 'Tap the flashlight to light up the room.',
        },
        4: {
          title: 'What helped you see the cat?',
          instruction: 'Choose the correct answer.',
          options: ['Air', 'Light', 'Sound'],
          answer: 'Light',
          wrongFeedback: 'Good try! Think about what helped you see the cat once the room got brighter.',
          correctTitle: 'Light is a form of energy that helps us see the objects around us.',
          correctFeedback: 'Excellent! Without light, we cannot see the objects around us.',
          correctInstruction: 'Switch the flashlight ON and OFF. Observe how the objects appear and disappear.',
        },
        7: {
          title: 'Brighter light makes objects easier to see.',
          instruction: 'Move the slider to see how brightness affects visibility.',
          levels: ['Dark', 'Dim', 'Bright'],
        },
        8: {
          title: "Some objects produce their own light. Others do not. Let's find out which is which.",
          instruction: 'Drag each object into the correct basket. Tap an object to see if it produces light.',
          basketA: 'Produces Light',
          basketB: 'Does Not Produce Light',
          tapLuminous: 'This object produces its own light.',
          tapNonLuminous: 'This object does not produce its own light.',
          allSorted: 'Great job! You sorted every object correctly.',
        },
        9: {
          defLuminous: 'Objects that produce their own light are called luminous objects.',
          defNonLuminous: 'Objects that do not produce their own light are called non-luminous objects.',
          instruction: 'Tap next to explore the light more.',
        },
        10: {
          title: "Let's explore the properties of light.",
          instruction: 'Tap the flashlight and observe the path of the light.',
        },
        11: {
          title: 'Can you make the light bend around the corner?',
          instruction: 'Rotate the flashlight and try to make the light reach around the corner.',
        },
        12: {
          title: 'Can light pass through this material?',
          instruction: 'Place the transparent sheet in the light beam and observe what happens.',
        },
        13: {
          title: 'Light passes through transparent materials and continues to travel in a straight line.',
          instruction: 'Tap next to see what happens when light meets an opaque object.',
        },
        14: {
          title: 'What about the cardboard? Will it block the light completely?',
          instruction: 'Place the cardboard in the path of the light and observe what happens.',
        },
        15: {
          title: 'Light travels in a straight line. Opaque objects block light and create shadows.',
          instruction: 'Drag the cardboard sheet along the light path and observe the size of the shadow.',
        },
        16: {
          title: "Let's review what we have discovered about light.",
          instruction: 'Tap next to explore the properties of light with more objects.',
        },
        17: {
          title: 'Which material lets the most light pass?',
          instruction: 'Place each material in the light beam and compare how much light passes through it.',
        },
        18: {
          title: 'Light passes through transparent materials, passes partly through translucent materials, and does not pass through opaque materials.',
          instruction: 'Applet complete!',
          classGlass: 'Transparent',
          classPaper: 'Translucent',
          classWood: 'Opaque',
        },
      },
    },
  },
};

window.appData = appData;
