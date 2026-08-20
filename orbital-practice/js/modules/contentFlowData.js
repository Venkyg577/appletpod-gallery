// =============================================================================
// Content Flow Data — screen definitions for the guided periodic table intro.
// Source spec: doc/contentflow.md (screens 1-26).
// =============================================================================

// advance: "tap" (wait for Next) | "interactive" (learner explores freely,
// Next always available). The flow is fully learner-paced — nothing advances
// on a timer.
export const CONTENT_FLOW_SCREENS = [
  {
    id: "s1-intro",
    caption: "Here is a periodic table, tap the buttons to understand the period and group.",
    controls: "period",
    advance: "tap",
  },

  // ── Periods ──
  {
    id: "s2-periods-intro",
    caption:
      "A period is a horizontal row of elements in the periodic table, where all elements have the same number of occupied electron shells.",
    controls: "period",
    advance: "tap",
  },
  {
    id: "s3-period-demo",
    caption: "Period 1 is the first horizontal row.",
    controls: "period",
    highlight: { type: "period", value: 1 },
    advance: "tap",
  },
  {
    id: "s4-periods-explore",
    caption: "Tap any period to see its row highlighted.",
    controls: "period",
    interactive: "period",
    advance: "interactive",
  },

  // ── Groups ──
  {
    id: "s5-groups-intro",
    caption:
      "A group is a vertical column of elements in the periodic table, where elements generally have similar chemical properties and the same number of valence electrons.",
    controls: "group",
    advance: "tap",
  },
  {
    id: "s6-group-demo",
    caption: "Group 1 is the first vertical column.",
    controls: "group",
    highlight: { type: "group", value: 1 },
    advance: "tap",
  },
  {
    id: "s7-groups-explore",
    caption: "Tap any group to see its column highlighted.",
    controls: "group",
    interactive: "group",
    advance: "interactive",
  },

  // ── Element → Period and Group ──
  {
    id: "s8-element-demo",
    caption: "Tap an element to discover its period and group in the periodic table.",
    highlight: { type: "element", value: 24 },
    advance: "tap",
  },
  {
    id: "s9-element-explore",
    caption: "Tap any element to see its period and group.",
    interactive: "element",
    advance: "interactive",
  },

  // ── Blocks ──
  {
    id: "s10-blocks-intro",
    caption:
      "The periodic table is divided into blocks based on which atomic orbital receives the valence (outermost) electrons of an element.",
    controls: "block",
    advance: "tap",
  },
  {
    id: "s11-s-block",
    caption:
      "s-block elements are elements in which the last electron enters the s-orbital. They are mainly found in Groups 1 and 2 of the periodic table.",
    controls: "block",
    highlight: { type: "block", value: "s" },
    advance: "tap",
  },
  {
    id: "s12-d-block",
    caption:
      "d-block elements are elements in which the last electron enters the d-orbital. They are mainly found in Groups 3 to 12 of the periodic table.",
    controls: "block",
    highlight: { type: "block", value: "d" },
    advance: "tap",
  },
  {
    id: "s13-p-block",
    caption:
      "p-block elements are elements in which the last electron enters the p-orbital. They are mainly found in Groups 13 to 18 of the periodic table.",
    controls: "block",
    highlight: { type: "block", value: "p" },
    advance: "tap",
  },
  {
    id: "s14-f-block",
    caption:
      "f-block elements are elements in which the last electron enters the f-orbital. They are mainly found in the two rows shown separately at the bottom of the periodic table.",
    controls: "block",
    highlight: { type: "block", value: "f" },
    advance: "tap",
  },
  {
    id: "s15-blocks-explore",
    caption: "Tap any block to see its elements highlighted.",
    controls: "block",
    interactive: "block",
    advance: "interactive",
  },

  // ── Element Types (hub: 10 on-demand type buttons, screens 16-26) ──
  {
    id: "s16-types-hub",
    caption: "Tap on each type to see the elements it belongs to.",
    controls: "category",
    interactive: "category",
    advance: "interactive",
    isFinal: true,
  },
];

export const PERIOD_VALUES = [1, 2, 3, 4, 5, 6, 7];

export const GROUP_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

export const BLOCK_VALUES = [
  { value: "s", label: "s - block" },
  { value: "p", label: "p - block" },
  { value: "d", label: "d - block" },
  { value: "f", label: "f - block" },
];

// Mirrors the legend categories in uiController.js createLegend().
export const CATEGORY_VALUES = [
  { value: "alkali-metal", label: "Alkali Metal" },
  { value: "alkaline-earth-metal", label: "Alkaline Earth" },
  { value: "transition-metal", label: "Transition Metal" },
  { value: "post-transition-metal", label: "Post-Transition" },
  { value: "metalloid", label: "Metalloid" },
  { value: "other-nonmetal", label: "Other non-metal" },
  { value: "halogen", label: "Halogen" },
  { value: "noble-gas", label: "Noble Gas" },
  { value: "lanthanide", label: "Lanthanides" },
  { value: "actinide", label: "Actinides" },
];
