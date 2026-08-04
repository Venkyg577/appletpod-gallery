var appData = {
  en: {
    "standard-ui": {
      buttons: {
        start: "Let's explore",
        start_over: "Explore again"
      },
      instructions: {
        tap_term: "Tap a term to explore it.",
        dev_note_title: "Developer Note"
      }
    },
    "content-ui": {
      menu: {
        plane: "Coordinate plane",
        xaxis: "x - axis",
        yaxis: "y - axis",
        origin: "Origin",
        coordinates: "Coordinates",
        xcoord: "x - Coordinate",
        ycoord: "y - Coordinate"
      },
      intro: {
        developer_note: "Please avoid automatic slide transitions. If no user interaction is required, use animations with a clearly noticeable duration instead of moving to the next slide automatically. Slides should transition only after the learner performs the required action (e.g., tap, click, drag). If no user action is involved, keep the content within the same slide and use animations with appropriate timing to explain the concept.",
        title: "Let's explore how points are located on a coordinate plane."
      },
      def: {
        plane: "A coordinate plane is formed by two perpendicular number lines called the x-axis and y-axis.",
        xaxis: "The horizontal number line is called the x-axis.",
        pos_xaxis: "The part of the x-axis to the right of 0 is called the positive x-axis.",
        neg_xaxis: "The part of the x-axis to the left of 0 is called the negative x-axis.",
        yaxis: "The vertical number line is called the y-axis.",
        pos_yaxis: "The part of the y-axis above 0 is called the positive y-axis.",
        neg_yaxis: "The part of the y-axis below 0 is called the negative y-axis.",
        origin: "The origin is the point where the x-axis and y-axis intersect.",
        coordinates: "The coordinates of a point are written as (x, y), where x and y locate the point on the coordinate plane.",
        origin_coords: "The origin has coordinates (0, 0)",
        xcoord_def: "The x-coordinate shows the horizontal distance from the origin O.",
        pos_xcoord: "A point to the right of O has a positive x-coordinate.",
        neg_xcoord: "A point to the left of O has a negative x-coordinate.",
        xaxis_rule: "Any point on the x-axis has coordinates of the form (x , 0).",
        ycoord_def: "The y-coordinate shows the vertical distance from the origin O.",
        pos_ycoord: "A point above O has a positive y-coordinate.",
        neg_ycoord: "A point below O has a negative y-coordinate.",
        yaxis_rule: "Any point on the y-axis has coordinates of the form (0 , y)."
      },
      tags: {
        pos_xaxis: "Positive x-axis",
        neg_xaxis: "Negative x-axis",
        pos_yaxis: "Positive y-axis",
        neg_yaxis: "Negative y-axis"
      },
      labels: {
        xaxis: "X- axis",
        yaxis: "Y- axis",
        units_3: "3 units",
        units_2: "2 units"
      },
      practice: {
        prompt: "Tap a point on the x-axis or y-axis to reveal its coordinates."
      }
    }
  }
};

if (typeof module !== 'undefined' && module.exports) module.exports = appData;
if (typeof window !== 'undefined') window.appData = appData;
