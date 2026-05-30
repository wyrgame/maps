var simplemaps_europemap_mapdata={
  main_settings: {
    //General settings
    width: "responsive", //'700' or 'responsive'
    background_color: "#92c9e8",
    background_transparent: "no",
    border_color: "#202020",
    popups: "detect",
    
    //State defaults
    state_description: "State description",
    state_color: "#88A4BC",
    state_hover_color: "#3B729F",           // ← Removed #3B729F
    state_hover_border_color: "#ffffff",    // ← Added to make the border pop white on hover
    state_hover_border_size: "3",          // ← Added to thicken the border on hover for crisp feedback
    state_url: "",
    border_size: 0.5,
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
      name: "Albania",
      color: "#9c2429",
      hover_color: "#7a1a1e"
    },
    AM: {
      name: "Armenia",
      color: "#cc7033",
      hover_color: "#b35d24"
    },
    AT: {
      name: "Austria",
      color: "#c94444",
      hover_color: "#ab3535"
    },
    BA: {
      name: "Bosnia and Herzegovina",
      color: "#2b4570",
      hover_color: "#1e3254"
    },
    BE: {
      name: "Belgium",
      color: "#44403c",
      hover_color: "#292524"
    },
    BG: {
      name: "Bulgaria",
      color: "#2e7d5c",
      hover_color: "#1f573f"
    },
    BY: {
      name: "Belarus",
      color: "#a13f3f",
      hover_color: "#823030"
    },
    CH: {
      name: "Switzerland",
      color: "#b83232",
      hover_color: "#942525"
    },
    CY: {
      name: "Cyprus",
      color: "#cca04e",
      hover_color: "#a68038"
    },
    CZ: {
      name: "Czech Republic",
      color: "#3a7099",
      hover_color: "#2b5475"
    },
    DE: {
      name: "Germany",
      color: "#3a3835",
      hover_color: "#262524"
    },
    DK: {
      name: "Denmark",
      color: "#a83246",
      hover_color: "#872434"
    },
    EE: {
      name: "Estonia",
      color: "#4b779a",
      hover_color: "#385c78"
    },
    ES: {
      name: "Spain",
      color: "#b82c25",
      hover_color: "#96201a"
    },
    FI: {
      name: "Finland",
      color: "#3b5973",
      hover_color: "#2a4154"
    },
    FR: {
      name: "France",
      color: "#2b3b82",
      hover_color: "#1e295e"
    },
    GB: {
      name: "United Kingdom",
      color: "#6b7280",
      hover_color: "#4b5563"
    },
    GE: {
      name: "Georgia",
      color: "#b53143",
      hover_color: "#912332"
    },
    GR: {
      name: "Greece",
      color: "#427aa1",
      hover_color: "#315e7d"
    },
    HR: {
      name: "Croatia",
      color: "#36558f",
      hover_color: "#263e6b"
    },
    HU: {
      name: "Hungary",
      color: "#386641",
      hover_color: "#27492d"
    },
    IE: {
      name: "Ireland",
      color: "#2a6f43",
      hover_color: "#1e5230"
    },
    IS: {
      name: "Iceland",
      color: "#344e80",
      hover_color: "#24375c"
    },
    IT: {
      name: "Italy",
      color: "#3a5f43",
      hover_color: "#28442e"
    },
    LT: {
      name: "Lithuania",
      color: "#bfa136",
      hover_color: "#967e26"
    },
    LU: {
      name: "Luxembourg",
      color: "#5ba2bf",
      hover_color: "#437b91"
    },
    LV: {
      name: "Latvia",
      color: "#782828",
      hover_color: "#5c1e1e"
    },
    MD: {
      name: "Moldova",
      color: "#8c6239",
      hover_color: "#6e4c2b"
    },
    ME: {
      name: "Montenegro",
      color: "#8a2b2b",
      hover_color: "#6b1f1f"
    },
    MK: {
      name: "Macedonia",
      color: "#b84a25",
      hover_color: "#94381b"
    },
    NL: {
      name: "Netherlands",
      color: "#c25925",
      hover_color: "#9c431a"
    },
    NO: {
      name: "Norway",
      color: "#9c2d42",
      hover_color: "#7d2132"
    },
    PL: {
      name: "Poland",
      color: "#bd4f6c",
      hover_color: "#9c3b53"
    },
    PT: {
      name: "Portugal",
      color: "#285238",
      hover_color: "#1b3826"
    },
    RO: {
      name: "Romania",
      color: "#2e4a87",
      hover_color: "#203461"
    },
    RS: {
      name: "Serbia",
      color: "#475569",
      hover_color: "#334155"
    },
    SE: {
      name: "Sweden",
      color: "#cca43b",
      hover_color: "#a6842b"
    },
    SI: {
      name: "Slovenia",
      color: "#4361ee",
      hover_color: "#3752c7"
    },
    SK: {
      name: "Slovakia",
      color: "#3f51b5",
      hover_color: "#303f9f"
    },
    TR: {
      name: "Turkey",
      color: "#a62424",
      hover_color: "#851c1c"
    },
    UA: {
      name: "Ukraine",
      color: "#d9b44a",
      hover_color: "#b59438"
    }
  },
  locations: {
    "0": {
      lat: "40.416",
      lng: "-3.703",
      name: "Spain",
      color: "green",
      description: "Spain",
      size: "40",
      scale: false,
      image_url: "Flags/flag-of-Spain.png"
    },
    "1": {
      lat: "46.857",
      lng: "2.351",
      name: "France",
      color: "green",
      description: "France",
      size: "20",
      scale: false,
      image_url: "Flags/flag-of-France.png"
    }
  },
  regions: {},
  labels: {},
  legend: {
    entries: []
  }
};
