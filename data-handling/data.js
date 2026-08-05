/* global window */
window.TABLE = [
  { vehicle: 1, key: 'bus', count: 5 },
  { vehicle: 2, key: 'car', count: 10 },
  { vehicle: 3, key: 'cycle', count: 3 },
  { vehicle: 4, key: 'bike', count: 7 },
  { vehicle: 5, key: 'tractor', count: 5 }
];
window.VEHICLE_ORDER = ['bus', 'car', 'cycle', 'bike', 'tractor'];
window.VEHICLE_COUNTS = { bus: 5, car: 10, cycle: 3, bike: 7, tractor: 5 };

const appData = {
  en: {
    'standard-ui': {
      labels: {
        vehicles: 'Vehicles',
        no_of_vehicles: 'No. of Vehicles',
        columns: 'Columns',
        rows: 'Row',
        column: 'Column',
        row: 'Row',
        x_axis: 'x-axis',
        y_axis: 'y-axis'
      },
      buttons: {
        pictograph: 'Pictograph',
        bar_graph: 'Bar graph',
        pie_chart: 'Pie chart',
        line_graph: 'Line Graph',
        horizontal_pictograph: 'Horizontal Pictograph',
        vertical_pictograph: 'Vertical Pictograph',
        scale_a: 'Scale-A : 1 to 10',
        scale_b: 'Scale-B : 1 to 5',
        check: 'Check',
        start_over: 'Start Over'
      },
      instructions: {
        tap_to_add_title: 'Tap next to represent the data using pictures.',
        tap_to_add_labels: 'Tap next to add the labels to each columns.',
        tap_to_add_labels_row: 'Tap next to add the labels to each row.',
        tap_plus_minus_check: 'Tap + or - to add or remove columns.',
        tap_plus_minus_check_rows: 'Tap + or – to add or remove rows.',
        drag_each_label: 'Drag each vehicle name to the correct column.',
        drag_each_label_row: 'Drag each vehicle name to the correct place on the X-axis.',
        tap_correct_option: 'Tap the correct option.',
        tap_to_select_choice: 'Tap to select your choice.',
        tap_title_pictograph: 'Tap the correct title for the pictograph.',
        tap_title_bargraph: 'Tap the correct title for the bar graph.',
        tap_correct_scale: 'Tap the correct scale.',
        tap_next_horizontal: 'Tap next to draw horizontal pictograph.',
        tap_next_vertical_axis: 'Tap next to represent vertical axis.',
        tap_next_bar_graph: 'Tap next to draw the bar graph.',
        tap_next_remaining_bars: 'Tap next to draw remaining bars.',
        tap_next_pie_chart: 'Tap next to represent the data in Pie chart.',
        drag_bar_until: 'Drag the bar until it reaches {count}.',
        drag_back_bus: 'Drag back the bus to remove the bus from the column.',
        tap_to_add_key: 'Tap next to draw the bar graph.'
      }
    },
    'content-ui': {
      vehicle_names: {
        bus: 'Bus',
        car: 'Car',
        cycle: 'Cycle',
        bike: 'Bike',
        tractor: 'Tractor'
      },
      vehicle_names_plural: {
        bus: 'buses',
        car: 'cars',
        cycle: 'cycles',
        bike: 'bikes',
        tractor: 'tractors'
      },
      dialogs: {
        table_title: 'Vehicles'
      },
      prompts: {
        s1_heading: 'Choose a way to represent the given data.',
        s1_instruction: 'Tap a representation to show the data.',
        s2_instruction: 'A pictograph uses pictures or symbols to represent data.',
        s2_question: 'How would you like to draw the pictograph?',
        add_columns_header: 'Vertical Pictograph',
        add_rows_header: "Now let's draw the same data as a horizontal pictograph.",
        structure_correct_header: 'Your pictograph now has one column for each type of vehicle.',
        structure_correct_header_rows: 'Your pictograph now has one row for each type of vehicle.',
        structure_vertical_1: 'Tap + or - to add or remove columns.',
        structure_vertical_2: 'Tap + or - to add or remove columns.',
        structure_horizontal_1: "Now let's draw the same data as a horizontal pictograph.",
        structure_horizontal_2: 'Tap + or – to add or remove rows.',
        labels_1: "Now, let's label each column with the vehicle names.",
        labels_2_col: 'Drag each vehicle name to the correct column.',
        labels_2_row: 'Drag each vehicle name to the correct place on the X-axis.',
        labels_3: 'Drag each vehicle name to the correct column.',
        plot_intro_1: 'Place the vehicle pictures into the correct column to match the data.',
        plot_intro_2: 'Start by dragging buses into the Bus column.',
        plot_continue: 'Keep dragging {vehicle_plural} until there are {count} {vehicle_plural} in the {vehicle} column.',
        title_1: 'The pictograph is ready. Choose the correct title for the pictograph.',
        title_2: 'Tap the correct title for the pictograph.',
        x_axis_1: 'The horizontal (X) axis shows the types of vehicles.',
        x_axis_2: 'Drag each vehicle name to the correct place on the X-axis.',
        y_scale_1: 'Choose the correct scale for the Y-axis. The scale should include the largest value in the data.',
        y_scale_2: 'The scale should include the largest value in the data.',
        y_scale_3: 'Tap the correct scale.',
        bar_demo_1: 'Now draw the bar for {vehicle}.',
        bar_demo_2: 'Drag the bar until it reaches {count}.',
        bar_remaining: 'Now, draw the bar graphs for the remaining vehicles.',
        bar_remaining_2: 'Draw the highlighted bar to match the data.',
        bar_title_1: 'The bar graph is ready. Each bar shows the number of vehicles for one type of vehicle.',
        bar_title_2: 'Tap the correct title for the bar graph.',
        menu_heading: 'Choose your way to represent the given data',
        menu_instruction: 'Tap to choose different ways to represent the data.',
        completion_1: 'A picture can represent more than a single object!',
        completion_2: 'You have completed the Vehicles pictograph and bar graph activity.',
        coming_soon_heading: 'Great work! You have represented the data as a pictograph and a bar graph.',
        coming_soon_note: 'Pie chart and Line graph are still in progress. Check back soon!'
      },
      feedback: {
        structure_too_few: 'Oops! There are 5 types of vehicles, so you need 5 columns. Add more columns.',
        structure_too_many: 'Oops! There are only 5 types of vehicles, so you need only 5 columns. Remove the extra columns.',
        structure_correct: 'Great! You have chosen 5 columns. One for each type of vehicle.',
        structure_too_few_rows: 'Oops! There are 5 types of vehicles, so you need 5 rows. Add more rows.',
        structure_too_many_rows: 'Oops! There are only 5 types of vehicles, so you need only 5 rows. Remove the extra rows.',
        structure_correct_rows: 'Great! You have chosen 5 rows. One for each type of vehicle.',
        label_correct: 'Excellent! You placed all the vehicle labels in the correct order.',
        label_correct_rows: 'Excellent! You placed all the vehicle names correctly.',
        label_incorrect: 'Check the data and place the vehicle labels in the same order.',
        label_incorrect_rows: 'Oops! Check the data and place the vehicle names in the correct order.',
        plot_too_few: 'Keep dragging {vehicle_plural} until there are {count} {vehicle_plural} in the {vehicle} column.',
        plot_too_many: 'There are only {count} {vehicle_plural} in the data. Remove the extra {vehicle}.',
        plot_wrong_vehicle: 'This is not a {vehicle}. Drag only {vehicle_plural} into the {vehicle} column.',
        plot_column_complete: 'Excellent! You added the correct number of {vehicle_plural}.',
        title_correct: 'Excellent! You chose the correct title for the pictograph.',
        title_incorrect: 'Read the pictograph carefully before choosing the title.',
        bar_title_correct: 'Excellent! You chose the correct title for the bar graph.',
        bar_title_incorrect: 'Read the bar graph carefully and choose the title that matches the data.',
        scale_incorrect: 'Oops! Look at the highest value in the data and choose a scale that fits all the values.',
        scale_correct: 'Excellent! You chose the correct scale for the bar graph.',
        bar_too_short: 'Oops! The {vehicle} bar should reach {count}. Make it taller.',
        bar_too_tall: 'The {vehicle} bar should reach only {count}. Make it shorter.'
      },
      options: {
        title_correct: 'Pictograph of different types of vehicles',
        title_incorrect: 'Pictograph of vehicles in 4 groups',
        bar_title_correct: 'Bar Graph of Different Types of Vehicles',
        bar_title_incorrect: 'Bar Graph of Vehicles in 4 Groups'
      },
      pictogram_title: 'Pictograph of different types of vehicles',
      bar_graph_title: 'Bar Graph of Different Types of Vehicles',
      label_placeholder: 'Drag here'
    }
  }
};

window.appData = appData;
