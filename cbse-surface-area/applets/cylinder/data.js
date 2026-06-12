/** @typedef {'en'|'id'|'tl'} Locale */

/** @type {Record<string, any>} */
const en = {
  "standard-ui": {
    buttons: {
      next: "Next",
      continue: "Continue",
      read_aloud: "Read aloud",
      stop_speech: "Stop",
    },
    labels: {
      locale: "Language",
      to_explore_cylinder: "To explore the cylinder",
      to_understand_surface_area: "Surface area →",
      to_continue: "To continue",
      to_explore_cone: "To explore cone",
      to_understand_next_solid: "To understand next solid",
    },
    instructions: {
      tap_highlighted: "Tap the highlighted part to continue.",
    },
  },
  "content-ui": {
    screens: {
      select: {
        title: "Let's explore how to find the surface area of different 3D solids.",
        cylinder: "Cylinder",
        cone: "Cone",
      },
      cyl_intro: {
        title: "Let us understand the surface area of a cylinder.",
        callout:
          "A cylinder has three surfaces: two circular bases and one curved surface.",
      },
      cyl_two_bases_top: {
        title: "A cylinder has two circular bases.",
        hint_top: "Tap the top circular face to open it.",
      },
      cyl_two_bases_bottom: {
        title: "A cylinder has two circular bases.",
        hint_bottom: "Tap the bottom circular face to open it.",
      },
      cyl_curved: {
        title: "A cylinder has one curved surface.",
        hint_curved: "Tap the curved surface to unfold it into a rectangle.",
      },
      cyl_rectangle: {
        title: "The curved surface forms a rectangle when unfolded.",
      },
      cyl_roll: {
        title: "The length of the rectangle equals the circumference of the circular base.",
        hint_roll: "Tap the circle to roll it along the rectangle.",
      },
      cyl_2pi: {
        title: "Length of the rectangle is 2πr",
      },
      cyl_combo: {
        title:
          "2 circular bases + a curved surface that unfolds into a rectangle of length 2πr.",
      },
      cyl_formula_opening: {
        title:
          "Surface area of a cylinder is the sum of the areas of its two circular bases and its curved surface.",
      },
      cyl_formula: {
        opening:
          "Surface area of a cylinder is the sum of the areas of its two circular bases and its curved surface.",
        surface_area: "Surface Area",
        step_combine: "= πr² + 2πrh + πr²",
        step_bases: "= 2πr² + 2πrh",
        step_factor: "= 2πr(r + h)",
        final_label: "Surface Area = 2πr(r + h)",
        area_circle: "Area of a circle with radius r is πr².",
        area_rect: "Area of a rectangle is length × breadth = 2πr × h",
        tap_or_wait: "Tap Next or wait to reveal each step.",
      },
      cone_gate: {
        title: "Let us understand the surface area of a cone.",
        subtitle: "Choose the cone to continue.",
      },
      cone_intro: {
        title: "A cone has two surfaces: one circular base and one curved surface.",
      },
      cone_base: {
        title: "The cone has one circular base.",
        hint_base: "Tap the circular base to open it.",
      },
      cone_curved: {
        title: "The cone also has one curved surface.",
        hint_curved: "Tap the curved surface to unfold it.",
      },
      cone_sector: {
        title: "Curved surface forms a sector when it is unfolded.",
        reference_caption: "Green sector should match this shape.",
      },
      cone_arc: {
        title: "The arc length of the sector equals the circumference of the base.",
        arc_label: "Length of the circular arc is 2πr",
        hint_roll: "Tap the base to roll along the arc.",
      },
      cone_formula_opening: {
        title:
          "Surface area of a cone is the sum of the area of the circular base and the area of the sector.",
      },
      cone_formula: {
        opening:
          "Surface area of a cone is the sum of the area of the circular base and the area of the sector.",
        surface_area: "Surface Area",
        curved_is_sector: "Curved Surface Area = Area of the Sector",
        curved_is_sector_title: "Curved surface area of a cone is equal to the area of the sector.",
        full_circle: "Circumference of full circle = 2πl",
        full_circle_circumference: "Circumference of the full circle",
        arc_length: "Arc length of the sector",
        area_full: "Area of the full circle",
        curved_area: "Curved Surface Area = πrl",
        csa_result_title: "Curved Surface Area of a Cone = πrl",
        sector_fraction_callout: "The sector is only a fraction of a full circle.",
        sum: "Surface Area = πrl + πr²",
        final_label: "Surface Area = πr(r + l)",
        ratio_note: "Ratio of arc to full circle = 2πr / 2πl",
        tap_or_wait: "Tap Next or wait to reveal each step.",
      },
      summary: {
        title:
          "Surface area is the total area covered by the outer surfaces of a three-dimensional object.",
        cylinder_formula: "Surface Area = 2πr(r + h)",
        cone_formula: "Surface Area = πr(r + l)",
        cylinder: "Cylinder",
        cone: "Cone",
      },
    },
  },
};

const id = {
  "standard-ui": {
    buttons: {
      next: "Berikutnya",
      continue: "Lanjut",
      read_aloud: "Baca keras",
      stop_speech: "Berhenti",
    },
    labels: {
      locale: "Bahasa",
      to_explore_cylinder: "Untuk menjelajahi tabung",
      to_understand_surface_area: "Untuk memahami luas permukaan",
      to_continue: "Untuk melanjutkan",
      to_explore_cone: "Untuk menjelajahi kerucut",
      to_understand_next_solid: "Untuk memahami benda berikutnya",
    },
    instructions: {
      tap_highlighted: "Ketuk bagian yang disorot untuk melanjutkan.",
    },
  },
  "content-ui": {
    screens: JSON.parse(JSON.stringify(en["content-ui"].screens)),
  },
};

const tl = {
  "standard-ui": {
    buttons: {
      next: "Susunod",
      continue: "Magpatuloy",
      read_aloud: "Basahin nang malakas",
      stop_speech: "Itigil",
    },
    labels: {
      locale: "Wika",
      to_explore_cylinder: "Upang tuklasin ang silindro",
      to_understand_surface_area: "Upang maunawaan ang surface area",
      to_continue: "Upang magpatuloy",
      to_explore_cone: "Upang tuklasin ang kono",
      to_understand_next_solid: "Upang maunawaan ang susunod na solid",
    },
    instructions: {
      tap_highlighted: "Tapikin ang naka-highlight na bahagi upang magpatuloy.",
    },
  },
  "content-ui": {
    screens: JSON.parse(JSON.stringify(en["content-ui"].screens)),
  },
};

/** Indonesian: full screen copy (keys mirror `en`) */
Object.assign(id["content-ui"].screens.select, {
  title: "Mari tinjau cara menemukan luas permukaan benda padat 3D yang berbeda.",
  cylinder: "Tabung",
  cone: "Kerucut",
});
Object.assign(id["content-ui"].screens.cyl_intro, {
  title: "Mari pahami luas permukaan sebuah tabung.",
  callout: "Tabung memiliki tiga permukaan: dua alas lingkaran dan satu permukaan lengkung.",
});
Object.assign(id["content-ui"].screens.cyl_two_bases_top, {
  title: "Tabung memiliki dua alas lingkaran.",
  hint_top: "Ketuk alas atas untuk membukanya.",
});
Object.assign(id["content-ui"].screens.cyl_two_bases_bottom, {
  title: "Tabung memiliki dua alas lingkaran.",
  hint_bottom: "Ketuk alas bawah untuk membukanya.",
});
Object.assign(id["content-ui"].screens.cyl_curved, {
  title: "Tabung memiliki satu permukaan lengkung.",
  hint_curved: "Ketuk permukaan lengkung untuk melipatnya menjadi persegi panjang.",
});
Object.assign(id["content-ui"].screens.cyl_rectangle, {
  title: "Permukaan lengkung membentuk persegi panjang saat dibentangkan.",
});
Object.assign(id["content-ui"].screens.cyl_roll, {
  title: "Panjang persegi panjang sama dengan keliling alas lingkaran.",
  hint_roll: "Ketuk lingkaran untuk menggelindingkannya sepanjang persegi panjang.",
});
Object.assign(id["content-ui"].screens.cyl_2pi, {
  title: "Panjang persegi panjang adalah 2πr",
});
Object.assign(id["content-ui"].screens.cyl_combo, {
  title:
    "Tabung memiliki dua alas berjejari r dan satu permukaan lengkung berpanjang 2πr.",
});
Object.assign(id["content-ui"].screens.cyl_formula_opening, {
  title:
    "Luas permukaan tabung adalah jumlah luas dua alas lingkaran dan permukaan lengkungnya.",
});
Object.assign(id["content-ui"].screens.cyl_formula, {
  opening:
    "Luas permukaan tabung adalah jumlah luas dua alas lingkaran dan permukaan lengkungnya.",
  surface_area: "Luas Permukaan",
  area_circle: "Luas lingkaran berjejari r adalah πr².",
  area_rect: "Luas persegi panjang = panjang × lebar = 2πr × h",
  tap_or_wait: "Ketuk Berikutnya atau tunggu untuk menampilkan setiap langkah.",
});
Object.assign(id["content-ui"].screens.cone_gate, {
  title: "Mari pahami luas permukaan sebuah kerucut.",
  subtitle: "Pilih kerucut untuk melanjutkan.",
});
Object.assign(id["content-ui"].screens.cone_intro, {
  title: "Kerucut memiliki dua permukaan: satu alas lingkaran dan satu permukaan lengkung.",
});
Object.assign(id["content-ui"].screens.cone_base, {
  title: "Kerucut memiliki satu alas lingkaran.",
  hint_base: "Ketuk alas lingkaran untuk membukanya.",
});
Object.assign(id["content-ui"].screens.cone_curved, {
  title: "Kerucut juga memiliki satu permukaan lengkung.",
  hint_curved: "Ketuk permukaan lengkung untuk membentangkannya.",
});
Object.assign(id["content-ui"].screens.cone_sector, {
  title: "Permukaan lengkung membentuk juring saat dibentangkan.",
  reference_caption: "Juring hijau harus cocok dengan bentuk ini.",
});
Object.assign(id["content-ui"].screens.cone_arc, {
  title: "Panjang busur juring sama dengan keliling alas.",
  arc_label: "Panjang busur lingkaran adalah 2πr",
  hint_roll: "Ketuk alas untuk menggelindingkannya sepanjang busur.",
});
Object.assign(id["content-ui"].screens.cone_formula_opening, {
  title:
    "Luas permukaan kerucut adalah jumlah luas alas lingkaran dan luas juring.",
});
Object.assign(id["content-ui"].screens.cone_formula, {
  opening:
    "Luas permukaan kerucut adalah jumlah luas alas lingkaran dan luas juring.",
  surface_area: "Luas Permukaan",
  curved_is_sector: "Luas permukaan lengkung = luas juring",
  curved_is_sector_title: "Luas permukaan lengkung kerucut sama dengan luas juring.",
  full_circle: "Keliling lingkaran penuh = 2πl",
  full_circle_circumference: "Keliling lingkaran penuh",
  arc_length: "Panjang busur juring",
  area_full: "Luas lingkaran penuh",
  curved_area: "Luas permukaan lengkung = πrl",
  csa_result_title: "Luas permukaan lengkung kerucut = πrl",
  sector_fraction_callout: "Juring hanyalah sebagian dari lingkaran penuh.",
  sum: "Luas Permukaan = πrl + πr²",
  ratio_note: "Rasio busur terhadap lingkaran penuh = 2πr / 2πl",
  tap_or_wait: "Ketuk Berikutnya atau tunggu untuk menampilkan setiap langkah.",
});
Object.assign(id["content-ui"].screens.summary, {
  title: "Luas permukaan adalah jumlah luas bagian luar suatu benda tiga dimensi.",
  cylinder: "Tabung",
  cone: "Kerucut",
});

/** Tagalog: full screen copy (keys mirror `en`) */
Object.assign(tl["content-ui"].screens.select, {
  title: "Tuklasin natin kung paano hanapin ang surface area ng iba't ibang 3D solid.",
  cylinder: "Silindro",
  cone: "Kono",
});
Object.assign(tl["content-ui"].screens.cyl_intro, {
  title: "Unawain natin ang surface area ng isang silindro.",
  callout: "Ang silindro ay may tatlong ibabaw: dalawang bilog na base at isang curved surface.",
});
Object.assign(tl["content-ui"].screens.cyl_two_bases_top, {
  title: "Ang silindro ay may dalawang bilog na base.",
  hint_top: "Tapikin ang ibabaw na bilog upang buksan ito.",
});
Object.assign(tl["content-ui"].screens.cyl_two_bases_bottom, {
  title: "Ang silindro ay may dalawang bilog na base.",
  hint_bottom: "Tapikin ang ibabang bilog upang buksan ito.",
});
Object.assign(tl["content-ui"].screens.cyl_curved, {
  title: "Ang silindro ay may isang curved surface.",
  hint_curved: "Tapikin ang curved surface upang ma-unfold ito sa parihaba.",
});
Object.assign(tl["content-ui"].screens.cyl_rectangle, {
  title: "Ang curved surface ay nagiging parihaba kapag na-unfold.",
});
Object.assign(tl["content-ui"].screens.cyl_roll, {
  title: "Ang haba ng parihaba ay katumbas ng circumference ng bilog na base.",
  hint_roll: "Tapikin ang bilog upang i-roll ito sa kahabaan ng parihaba.",
});
Object.assign(tl["content-ui"].screens.cyl_2pi, {
  title: "Ang haba ng parihaba ay 2πr",
});
Object.assign(tl["content-ui"].screens.cyl_combo, {
  title:
    "Ang silindro ay may dalawang base na may radius na r at isang curved surface na may habang 2πr.",
});
Object.assign(tl["content-ui"].screens.cyl_formula_opening, {
  title:
    "Ang surface area ng silindro ay ang kabuuan ng mga lugar ng dalawang bilog na base at ang curved surface.",
});
Object.assign(tl["content-ui"].screens.cyl_formula, {
  opening:
    "Ang surface area ng silindro ay ang kabuuan ng mga lugar ng dalawang bilog na base at ang curved surface.",
  surface_area: "Surface Area",
  area_circle: "Ang lugar ng bilog na may radius na r ay πr².",
  area_rect: "Ang lugar ng parihaba ay haba × lapad = 2πr × h",
  tap_or_wait: "Tapikin ang Susunod o maghintay upang ipakita ang bawat hakbang.",
});
Object.assign(tl["content-ui"].screens.cone_gate, {
  title: "Unawain natin ang surface area ng kono.",
  subtitle: "Piliin ang kono upang magpatuloy.",
});
Object.assign(tl["content-ui"].screens.cone_intro, {
  title: "Ang kono ay may dalawang ibabaw: isang bilog na base at isang curved surface.",
});
Object.assign(tl["content-ui"].screens.cone_base, {
  title: "Ang kono ay may isang bilog na base.",
  hint_base: "Tapikin ang bilog na base upang buksan ito.",
});
Object.assign(tl["content-ui"].screens.cone_curved, {
  title: "Ang kono ay may isang curved surface din.",
  hint_curved: "Tapikin ang curved surface upang ma-unfold ito.",
});
Object.assign(tl["content-ui"].screens.cone_sector, {
  title: "Ang curved surface ay nagiging sector kapag na-unfold.",
  reference_caption: "Ang berdeng sector ay dapat tumugma sa hugis na ito.",
});
Object.assign(tl["content-ui"].screens.cone_arc, {
  title: "Ang haba ng busur ng sector ay katumbas ng circumference ng base.",
  arc_label: "Ang haba ng busur ng bilog ay 2πr",
  hint_roll: "Tapikin ang base upang i-roll ito sa kahabaan ng busur.",
});
Object.assign(tl["content-ui"].screens.cone_formula_opening, {
  title:
    "Ang surface area ng kono ay ang kabuuan ng lugar ng bilog na base at ng sector.",
});
Object.assign(tl["content-ui"].screens.cone_formula, {
  opening:
    "Ang surface area ng kono ay ang kabuuan ng lugar ng bilog na base at ng sector.",
  surface_area: "Surface Area",
  curved_is_sector: "Curved Surface Area = Area ng Sector",
  curved_is_sector_title: "Ang curved surface area ng kono ay katumbas ng area ng sector.",
  full_circle: "Circumference ng buong bilog = 2πl",
  full_circle_circumference: "Circumference ng buong bilog",
  arc_length: "Haba ng busur ng sector",
  area_full: "Lugar ng buong bilog",
  curved_area: "Curved Surface Area = πrl",
  csa_result_title: "Curved Surface Area ng Kono = πrl",
  sector_fraction_callout: "Ang sector ay bahagi lamang ng buong bilog.",
  sum: "Surface Area = πrl + πr²",
  ratio_note: "Ratio ng busur sa buong bilog = 2πr / 2πl",
  tap_or_wait: "Tapikin ang Susunod o maghintay upang ipakita ang bawat hakbang.",
});
Object.assign(tl["content-ui"].screens.summary, {
  title: "Ang surface area ay kabuuang sakop ng labas ng isang three-dimensional object.",
  cylinder: "Silindro",
  cone: "Kono",
});

export const appData = { en, id, tl };

export default appData;
