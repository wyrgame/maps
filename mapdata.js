var simplemaps_europemap_mapdata={
  main_settings: {
    //General settings
    width: "responsive", //'700' or 'responsive'
    background_color: "#FFFFFF",
    background_transparent: "yes",
    border_color: "#ffffff",
    popups: "detect",
    
    //State defaults
    state_description: "State description",
    state_color: "#88A4BC",
    state_hover_color: "#3B729F",           // ← Removed #3B729F
    state_hover_border_color: "#ffffff",    // ← Added to make the border pop white on hover
    state_hover_border_size: "3",          // ← Added to thicken the border on hover for crisp feedback
    state_url: "",
    border_size: 1.5,
    all_states_inactive: "no",
    all_states_zoomable: "no",
    
    //Location defaults
    location_description: "Location description",
    location_color: "#FF0067",
    location_opacity: 0.8,
    location_hover_opacity: 1,
    location_url: "",
    location_size: 25,
    location_type: "image",
    location_image_source: "frog.png",
    location_border_color: "#FFFFFF",
    location_border: 2,
    location_hover_border: 2.5,
    all_locations_inactive: "no",
    all_locations_hidden: "no",
    
    //Label defaults
    label_color: "#d5ddec",
    label_hover_color: "#d5ddec",
    label_size: 22,
    label_font: "Arial",
    hide_labels: "no",
    manual_zoom: "yes",                    
    back_image: "no",
    arrow_color: "#cecece",
    arrow_color_border: "#808080",
    initial_back: "no",
    initial_zoom: -1,
    initial_zoom_solo: "no",
    region_opacity: 1,
    region_hover_opacity: 0.6,
    zoom_out_incrementally: "yes",          // ← Changed to "no" to prevent map wiggling on refresh
    zoom_percentage: 1,                    // ← Changed to 1 to lock structural sizing perfectly 
    zoom_time: 0.5,       
    
    //Popup settings
    popup_color: "white",
    popup_opacity: 0.9,
    popup_shadow: 1,
    popup_corners: 5,
    popup_font: "12px/1.5 Verdana, Arial, Helvetica, sans-serif",
    popup_nocss: "no",
    
    //Advanced settings
    div: "map",
    auto_load: "yes",
    url_new_tab: "no",
    images_directory: "default",
    fade_time: 0.1,
    link_text: "View Website",
    state_image_url: "",
    state_image_position: "",
    location_image_url: ""
  },
  state_specific: {
    AL: {
      name: "Albania"
    },
    AM: {
      name: "Armenia"
    },
    AT: {
      name: "Austria"
    },
    BA: {
      name: "Bosnia and Herzegovina"
    },
    BE: {
      name: "Belgium"
    },
    BG: {
      name: "Bulgaria"
    },
    BY: {
      name: "Belarus"
    },
    CH: {
      name: "Switzerland"
    },
    CY: {
      name: "Cyprus"
    },
    CZ: {
      name: "Czech Republic"
    },
    DE: {
      name: "Germany",
      color: "#30300d"
    },
    DK: {
      name: "Denmark"
    },
    EE: {
      name: "Estonia"
    },
    ES: {
      name: "Spain",
      color: "#d5120d",
      hover_color: "#b0100c"
    },
    FI: {
      name: "Finland"
    },
    FR: {
      name: "France",
      color: "#0d20d5"
    },
    GB: {
      name: "United Kingdom",
      color: "#9ea0b1"
    },
    GE: {
      name: "Georgia"
    },
    GR: {
      name: "Greece"
    },
    HR: {
      name: "Croatia"
    },
    HU: {
      name: "Hungary"
    },
    IE: {
      name: "Ireland",
      color: "green"
    },
    IS: {
      name: "Iceland"
    },
    IT: {
      name: "Italy"
    },
    LT: {
      name: "Lithuania"
    },
    LU: {
      name: "Luxembourg"
    },
    LV: {
      name: "Latvia"
    },
    MD: {
      name: "Moldova"
    },
    ME: {
      name: "Montenegro"
    },
    MK: {
      name: "Macedonia"
    },
    NL: {
      name: "Netherlands"
    },
    NO: {
      name: "Norway"
    },
    PL: {
      name: "Poland"
    },
    PT: {
      name: "Portugal"
    },
    RO: {
      name: "Romania"
    },
    RS: {
      name: "Serbia"
    },
    SE: {
      name: "Sweden",
      color: "#e2e200"
    },
    SI: {
      name: "Slovenia"
    },
    SK: {
      name: "Slovakia"
    },
    TR: {
      name: "Turkey"
    },
    UA: {
      name: "Ukraine"
    }
  },
  locations: {
    "0": {
      lat: "40.416",
      lng: "-3.703",
      name: "Madrid",
      color: "green",
      description: "Real Madrid",
      size: "40",
      image_url: "Flags/flag-of-Spain.png"
    },
    "1": {
      lat: "46.857",
      lng: "2.351",
      name: "Paris",
      color: "green",
      description: "PSG",
      size: "20",
      image_url: "Flags/flag-of-France.png"
    }
  },
  regions: {},
  labels: {},
  legend: {
    entries: []
  }
};
