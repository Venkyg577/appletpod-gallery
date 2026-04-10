var appData = {
  en: {
    "standard-ui": {
      buttons: {
        add_bulb: "Add bulb",
        remove_bulb: "Remove bulb",
        on: "ON",
        off: "OFF"
      }
    },
    "content-ui": {
      dialogs: {
        page_title: "Does adding a bulb make all the others dimmer?",
        page_takeaway: "Voltage across a bulb decides its brightness.",
        parallel_title: "PARALLEL CIRCUIT",
        parallel_voltage_desc: "Each bulb has full voltage",
        parallel_brightness_desc: "Full voltage across each bulb \u2192 Full brightness",
        parallel_insight: "Full voltage to each bulb \u2192 Full brightness \u2192 Independent of each other",
        series_title: "SERIES CIRCUIT",
        series_voltage_desc: "Voltage gets distributed across each bulb",
        series_brightness_desc: "Lesser voltage across each bulb \u2192 lesser brightness",
        series_insight_flow: "\u2192\u2003same current everywhere\u2003;\u2003bulbs share the voltage\u2003\u2192"
      },
      labels: {
        voltage: "1.5V",
        brightness: "Brightness",
        percent: "{value}%",
        add_remove: "Add / Remove\nbulbs"
      }
    }
  },
  "id-ID": {
    "standard-ui": {
      buttons: {
        add_bulb: "Tambah lampu",
        remove_bulb: "Hapus lampu",
        on: "NYALA",
        off: "MATI"
      }
    },
    "content-ui": {
      dialogs: {
        page_title: "Apakah menambah lampu membuat yang lain lebih redup?",
        page_takeaway: "Tegangan pada lampu menentukan kecerahannya.",
        parallel_title: "RANGKAIAN PARALEL",
        parallel_voltage_desc: "Setiap lampu mendapat tegangan penuh",
        parallel_brightness_desc: "Tegangan penuh pada setiap lampu \u2192 Kecerahan penuh",
        parallel_insight: "Tegangan penuh ke setiap lampu \u2192 Kecerahan penuh \u2192 Independen satu sama lain",
        series_title: "RANGKAIAN SERI",
        series_voltage_desc: "Tegangan dibagi ke setiap lampu",
        series_brightness_desc: "Tegangan lebih kecil pada setiap lampu \u2192 kecerahan lebih rendah",
        series_insight_flow: "\u2192\u2003arus sama di mana-mana\u2003;\u2003lampu berbagi tegangan\u2003\u2192"
      },
      labels: {
        voltage: "1,5V",
        brightness: "Kecerahan",
        percent: "{value}%",
        add_remove: "Tambah / Hapus\nlampu"
      }
    }
  },
  fil: {
    "standard-ui": {
      buttons: {
        add_bulb: "Dagdag bombilya",
        remove_bulb: "Tanggal bombilya",
        on: "BUKAS",
        off: "SARADO"
      }
    },
    "content-ui": {
      dialogs: {
        page_title: "Kapag nagdagdag ng bombilya, nagdidilim ba ang lahat?",
        page_takeaway: "Ang boltahe sa bombilya ang nagpapasya ng liwanag nito.",
        parallel_title: "PARALLEL NA CIRCUIT",
        parallel_voltage_desc: "Bawat bombilya ay may buong boltahe",
        parallel_brightness_desc: "Buong boltahe sa bawat bombilya \u2192 Buong liwanag",
        parallel_insight: "Buong boltahe sa bawat bombilya \u2192 Buong liwanag \u2192 Hindi nakadepende sa isa't isa",
        series_title: "SERIES NA CIRCUIT",
        series_voltage_desc: "Ang boltahe ay nababahagi sa bawat bombilya",
        series_brightness_desc: "Mas mababang boltahe sa bawat bombilya \u2192 mas mababang liwanag",
        series_insight_flow: "\u2192\u2003pareho ang kuryente sa lahat\u2003;\u2003nagbabahagi ang boltahe\u2003\u2192"
      },
      labels: {
        voltage: "1.5V",
        brightness: "Liwanag",
        percent: "{value}%",
        add_remove: "Dagdag / Tanggal\nbombilya"
      }
    }
  }
};

if (typeof module !== 'undefined' && module.exports) module.exports = appData;
if (typeof window !== 'undefined') window.appData = appData;
