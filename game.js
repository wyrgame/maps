console.log("🚀 FIFA Imperialism Engine Active - Advanced Ownership Matrix Tracking");

// Core Simulation State
let gameState = {
  currentMode: 'sandbox', // 'sandbox' or 'battle'
  selectedCountry: null,  // Stores the ID of the attacking EMPIRE (e.g., 'IE')
  currentBrushColor: null,
  currentBrushHoverColor: null,
  currentBrushFlag: null,
  
  // Battle System Queues
  attackerId: null,
  defenderId: null
};

// History State Management Stacks
let historyStack = [];
let redoStack = [];
const MAX_HISTORY = 30; // Prevents browser memory leakage during long sims

// Permanent Database of Team Assets (Never changes mid-game)
const countryFlags = {
  IE: "Flags/flag-of-Ireland.png",
  GB: "Flags/flag-of-United-Kingdom.png",
  FR: "Flags/flag-of-France.png",
  DE: "Flags/flag-of-Germany.png",
  SE: "Flags/flag-of-Sweden.png",
  ES: "Flags/flag-of-Spain.png"
};

// Permanent location indices where each country's visual flag marker sits on the canvas
const countryMarkers = { 
  ES: "0", 
  FR: "1" 
};

// Initialize Ownership Matrix on start and completely synchronize default hovers
function initOwnershipMatrix() {
  if (typeof simplemaps_europemap_mapdata === "undefined") return;
  const states = simplemaps_europemap_mapdata.state_specific;
  const locations = simplemaps_europemap_mapdata.locations;
  
  // 1. Normalize and clean up land mass region hovers
  for (let id in states) {
    if (!states[id].owner) {
      // At the start of the simulation, every land mass is owned by its original native team
      states[id].owner = id; 
    }
    // Set a clean description fallback for the country region shape
    if (!states[id].description || states[id].description === "State Description") {
      states[id].description = "Sovereign Territory";
    }
  }

  // 2. FIXED: Cross-reference flag markers on startup and synchronize them to match the land masses
  for (let landId in countryMarkers) {
    const markerId = countryMarkers[landId];
    
    // Check if both the country region and the flag marker configuration exist
    if (states[landId] && locations[markerId]) {
      // Force the flag marker to copy the exact native name and description of its land mass
      locations[markerId].name = states[landId].name || landId;
      locations[markerId].description = states[landId].description;
    }
  }
}

function initGame() {
  setTimeout(() => {
    if (typeof simplemaps_europemap === "undefined") return;

    // Boot structural database tracking metrics
    initOwnershipMatrix();
    setupDomEventListeners();
    
    // --- WIRE UP CUSTOM GOOGLE-MAPS STYLE ZOOM CONTROLS ---
    const zoomInBtn = document.getElementById("custom-zoom-in");
    const zoomOutBtn = document.getElementById("custom-zoom-out");
    const zoomResetBtn = document.getElementById("custom-zoom-reset");

    if (zoomInBtn) {
      zoomInBtn.addEventListener("click", () => { simplemaps_europemap.zoom_in(); });
    }
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener("click", () => { simplemaps_europemap.zoom_out(); });
    }
    if (zoomResetBtn) {
      zoomResetBtn.addEventListener("click", () => { simplemaps_europemap.zoom_home(); });
    }

    // Reverse-Map Lookup Array Helper
    function getCountryIdFromMarker(markerId) {
      return Object.keys(countryMarkers).find(key => countryMarkers[key] === markerId.toString());
    }

    // --- MAP ENGINE INPUT HOOKS ---
    simplemaps_europemap.hooks.click_state = function(id) {
      processInput(id);
    };

    simplemaps_europemap.hooks.click_location = function(id) {
      const countryId = getCountryIdFromMarker(id);
      if (countryId) processInput(countryId);
    };

    // Standard native sizing recalculation fixes
    simplemaps_europemap.hooks.zoom_complete = function() { fixFlagSizesNative(); };

    // --- INTERACTION NORMALIZATION GATEWAY ---
    function processInput(id) {
      if (gameState.currentMode === 'sandbox') {
        handleManualSandbox(id);
      } else {
        // Smart Context Check: Check where user focus currently sits
        const activeEl = document.activeElement;
        let forcedTarget = null;
        if (activeEl && activeEl.id === "defender-search") {
          forcedTarget = "defender";
        } else if (activeEl && activeEl.id === "attacker-search") {
          forcedTarget = "attacker";
        }
        handleBattleSelection(id, forcedTarget);
      }
    }

    // --- MODE 1: FIFA IMPERIALISM SANDBOX MECHANIC ---
    function handleManualSandbox(id) {
      const state = simplemaps_europemap_mapdata.state_specific[id];
      if (!state) return;

      const currentOwnerId = state.owner || id; // Find who currently rules the clicked land
      const statusBox = document.getElementById("brush-status");
      const clearBtn = document.getElementById("btn-clear-brush");

      // Grab the window's current triggering mouse event to check for modifier keys
      const currentEvent = window.event || {};
      const isHoldingShift = currentEvent.shiftKey;

      // CASE 1: Explicit Brush Switching (Triggered via Shift + Click or if no brush is active)
      if (!gameState.selectedCountry || isHoldingShift) {
        // Load the EMPIRE of the team ruling this land as our active brush
        gameState.selectedCountry = currentOwnerId;
        
        // Always fetch the original pristine baseline data of the ruling empire
        const ownerHomeState = simplemaps_europemap_mapdata.state_specific[currentOwnerId];
        gameState.currentBrushColor = ownerHomeState ? ownerHomeState.color : state.color;
        gameState.currentBrushHoverColor = ownerHomeState ? (ownerHomeState.hover_color || ownerHomeState.color) : (state.hover_color || state.color);
        gameState.currentBrushFlag = countryFlags[currentOwnerId] || null;
        
        if (statusBox) {
          statusBox.className = "status-active";
          statusBox.innerText = `Active Brush: ${ownerHomeState?.name || currentOwnerId}`;
          statusBox.style.color = gameState.currentBrushColor;
        }
        
        if (clearBtn) clearBtn.classList.remove("hidden");
        updateLog(`Loaded Paintbrush Tool: ${ownerHomeState?.name || currentOwnerId} (Shift-click land to switch attacker)`);
        return;
      }

      // CASE 2: Clicking a territory already owned by your active brush normal click -> Deselect it
      if (gameState.selectedCountry === currentOwnerId) {
        resetSandboxBrush();
        updateLog("Paintbrush tool put away.");
        return;
      }

      // CASE 3: Standard Left Click with an Active Brush -> CONQUER TARGET!
      // Rule 3/4 Applied to Sandbox Paintbrush as well: Cascade conversions globally
      paintEmpire(currentOwnerId, gameState.currentBrushColor, gameState.currentBrushHoverColor, gameState.currentBrushFlag, gameState.selectedCountry);
    }

    // --- MODE 2: STRUCTURAL WAR SELECTION (AUTO-SYNC SEARCH FIELDS) ---
    function handleBattleSelection(id, forcedTarget = null) {
      const state = simplemaps_europemap_mapdata.state_specific[id];
      if (!state) return;

      const currentOwnerId = state.owner || id; // Target true imperial master ruler
      const btn = document.getElementById("btn-simulate");
      const resultCard = document.getElementById("battle-result"); // Grab result box reference
      const ownerHomeState = simplemaps_europemap_mapdata.state_specific[currentOwnerId] || state;

      const attInput = document.getElementById("attacker-search");
      const defInput = document.getElementById("defender-search");

      // Check if we should fill the attacker or defender field
      const shouldAssignAsDefender = forcedTarget === "defender" || (forcedTarget !== "attacker" && gameState.attackerId && gameState.attackerId !== currentOwnerId);

      // Dynamic naming logic: Check total land count to decide if they are an Empire yet
      const territoryCount = countTerritoriesOwnedBy(currentOwnerId);
      const suffix = territoryCount > 1 ? " Empire" : "";
      const formattedName = `${ownerHomeState.name || currentOwnerId}${suffix}`;

      if (!shouldAssignAsDefender) {
        // ASSIGN ATTACKER
        gameState.attackerId = currentOwnerId;
        if (attInput) {
          attInput.value = formattedName;
          attInput.blur(); // Stripping cursor focus prevents map clicks from overwriting selection
        }
        updateLog(`Attacker selected: ${formattedName}.`);
      } 
      else {
        // ASSIGN DEFENDER
        gameState.defenderId = id; 
        
        if (defInput) {
          defInput.value = formattedName;
          defInput.blur(); // Stripping cursor focus prevents map clicks from overwriting selection
        }

        // FIXED: Instantly wipe out the old victory/defeat alert panel upon target selection change
        if (resultCard) {
          resultCard.classList.add("hidden");
        }

        updateLog(`Target territory confirmed: ${state.name || id} (Part of ${formattedName}).`);
      }

      // Dynamic Validation Pass: Instantly evaluate activation rules regardless of choice order!
      if (btn) {
        btn.disabled = !(gameState.attackerId && gameState.defenderId);
        if (!btn.disabled) {
          updateLog("Ready to simulate battle.");
        }
      }
    }

    // Make this function accessible to the global typing search handler scope
    window.triggerMapBattleSelection = handleBattleSelection;

  }, 1500);
}

// --- CORE SIMULATION / BATTLE CALCULATION LAYER ---
function runBattleSimulation() {
  const attId = gameState.attackerId; // This is the Attacking Empire ID
  const defRegionId = gameState.defenderId; // This is the Target Region ID clicked
  
  const defState = simplemaps_europemap_mapdata.state_specific[defRegionId];
  if (!defState) return;

  const defId = defState.owner || defRegionId; // True defending Empire master owning that land
  
  const attackerName = simplemaps_europemap_mapdata.state_specific[attId]?.name || attId;
  const defenderName = simplemaps_europemap_mapdata.state_specific[defId]?.name || defId;
  
  // Rule 1 FIXED: Civil War Prevention Guard Clause
  if (attId === defId) {
    updateLog(`⚠️ Invalid Action: ${attackerName} cannot launch a military strike against its own Empire borders!`);
    clearBattleQueue();
    return;
  }

  updateLog(`Simulating engagement: ${attackerName} Empire vs ${defenderName} Empire...`);
  
  // Calculate Territory Modifier Count to favor larger empires
  let attCount = countTerritoriesOwnedBy(attId);
  let defCount = countTerritoriesOwnedBy(defId);
  
  // Base Probability Formula: 50% base +/- weight modifiers
  let attackerWinChance = 0.5 + (attCount - defCount) * 0.05;
  attackerWinChance = Math.min(Math.max(attackerWinChance, 0.15), 0.85); // Bound margins to maintain upset potential
  
  const btn = document.getElementById("btn-simulate");
  const resultCard = document.getElementById("battle-result");
  if (btn) btn.disabled = true;

  // Add a slight delay loop to build narrative suspense
  let ticks = 0;
  const interval = setInterval(() => {
    if (btn) btn.innerText = `🎲 Rolling Outcomes${".".repeat(ticks % 4)}`;
    ticks++;
    if (ticks > 6) {
      clearInterval(interval);
      
      const rand = Math.random();
      const attackerWon = rand < attackerWinChance;
      
      // Flush defender slot, keep attacker loaded for succession attacks
      gameState.defenderId = null;
      const defInput = document.getElementById("defender-search");
      if (defInput) defInput.value = "";

      if (btn) {
        btn.innerText = "⚡ Click to Battle";
        btn.disabled = (gameState.attackerId && gameState.defenderId) ? false : true;
      }
      if (resultCard) resultCard.classList.remove("hidden");
      
      if (attackerWon) {
        if (resultCard) {
          resultCard.className = "result-card win";
          resultCard.innerHTML = `<strong>VICTORY: ${attackerName} Wins!</strong><br>The entire ${defenderName} Empire has capitulated and collapsed!`;
        }
        
        // Execute structural map transfer using the Attacking Empire's original base color properties
        const attState = simplemaps_europemap_mapdata.state_specific[attId];
        
        // Rule 3 & 4 FIXED: Convert all regions belonging to the defId empire to the attacker's empire details
        paintEmpire(defId, attState.color, (attState.hover_color || attState.color), countryFlags[attId], attId);
      } else {
        if (resultCard) {
          resultCard.className = "result-card";
          resultCard.style.backgroundColor = "rgba(239, 68, 68, 0.2)";
          resultCard.style.border = "1px solid var(--accent-red)";
          resultCard.style.color = "#f87171";
          resultCard.innerHTML = `<strong>DEFEAT: ${defenderName} Repelled the Attack!</strong><br>Borders remain unchanged.`;
        }
      }
      
      updateLog(`Battle complete. Outcome resolved.`);
    }
  }, 375);
}

// Dom Event Initialization
function setupDomEventListeners() {
  document.querySelectorAll('input[name="game-mode"]').forEach(radioInput => {
    radioInput.addEventListener('change', (e) => {
      gameState.currentMode = e.target.value;

      if (gameState.currentMode === 'sandbox') {
        document.getElementById("sandbox-interface").classList.remove("hidden");
        document.getElementById("battle-interface").classList.add("hidden");
        clearBattleQueue();
      } else {
        document.getElementById("sandbox-interface").classList.add("hidden");
        document.getElementById("battle-interface").classList.remove("hidden");
        resetSandboxBrush();
      }
      updateLog(`Switched control framework to: ${gameState.currentMode === 'sandbox' ? 'Manual Sandbox' : 'Battle Sim'}`);
    });
  });

  const simulateBtn = document.getElementById("btn-simulate");
  if (simulateBtn) {
    simulateBtn.addEventListener("click", runBattleSimulation);
  }

  const clearBtn = document.getElementById("btn-clear-brush");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      resetSandboxBrush();
      updateLog("Paintbrush cleared manually via sidebar.");
    });
  }

  // History Operation Click Registry Assignments
  const undoBtn = document.getElementById("btn-undo");
  if (undoBtn) undoBtn.addEventListener("click", executeUndo);

  const redoBtn = document.getElementById("btn-redo");
  if (redoBtn) redoBtn.addEventListener("click", executeRedo);

  // --- TEXT INTERACTION SEARCH ENGINE DROP-DOWNS LISTENER ---
  const setupSearchDropdowns = () => {
    const attInput = document.getElementById("attacker-search");
    const attDropdown = document.getElementById("attacker-dropdown");
    const defInput = document.getElementById("defender-search");
    const defDropdown = document.getElementById("defender-dropdown");

    const filterTeams = (inputEl, dropdownEl, mode) => {
      if (!inputEl || !dropdownEl) return;
      
      inputEl.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        dropdownEl.innerHTML = "";
        
        if (!query) {
          dropdownEl.classList.add("hidden");
          return;
        }

        const states = simplemaps_europemap_mapdata.state_specific;
        let matches = [];

        for (let id in states) {
          const name = (states[id].name || id).toLowerCase();
          // Uses .startsWith() to reject middle matching letters
          if (name.startsWith(query)) {
            matches.push({ id: id, name: states[id].name || id });
          }
        }

        if (matches.length === 0) {
          dropdownEl.classList.add("hidden");
          return;
        }

        dropdownEl.classList.remove("hidden");
        matches.forEach(match => {
          const item = document.createElement("div");
          item.className = "dropdown-item";
          item.innerText = match.name;
          item.addEventListener("click", () => {
            if (typeof window.triggerMapBattleSelection === "function") {
              if (mode === "attacker") {
                gameState.attackerId = null;
                window.triggerMapBattleSelection(match.id, "attacker");
              } else {
                window.triggerMapBattleSelection(match.id, "defender");
              }
            }
            dropdownEl.classList.add("hidden");
          });
          dropdownEl.appendChild(item);
        });
      });

      // Handle Keydown "Enter" inside inputs
      inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const firstMatchItem = dropdownEl.querySelector(".dropdown-item");
          if (firstMatchItem) {
            firstMatchItem.click();
          }
        }
      });

      // Close autocomplete floating list boxes if clicking out onto canvas
      document.addEventListener("click", (evt) => {
        if (!inputEl.contains(evt.target) && !dropdownEl.contains(evt.target)) {
          dropdownEl.classList.add("hidden");
        }
      });
    };

    filterTeams(attInput, attDropdown, "attacker");
    filterTeams(defInput, defDropdown, "defender");
  };

  setupSearchDropdowns();
}

// --- GLOBAL EMPIRE PAINT LAYER: HANDLES CASCADING CONQUESTS & TOOLTIP SYNCING ---
function paintEmpire(targetEmpireMasterId, color, hoverColor, flagUrl, attackerEmpireId) {
  if (typeof simplemaps_europemap_mapdata === "undefined") return;
  const states = simplemaps_europemap_mapdata.state_specific;

  // SAVE TIMELINE SNAPSHOT BEFORE EXECUTION TRANSITIONS ALTER DATA
  saveHistorySnapshot();

  // Determine standard baseline naming conventions depending on total size of attacker empire
  const attackerHomeState = states[attackerEmpireId];
  const attackerBaseName = attackerHomeState?.name || attackerEmpireId;
  
  // Create a clean layout label (e.g., "France Empire")
  const newEmpireLabelName = `${attackerBaseName} Empire`;
  let regionsConqueredCount = 0;

  // Loop through all regions on the map. If a territory is owned by the target empire, shift it to the attacker.
  for (let id in states) {
    const currentOwnerOfRegion = states[id].owner || id;
    
    if (currentOwnerOfRegion === targetEmpireMasterId) {
      regionsConqueredCount++;
      
      // 1. Shift land tracking color and structural parameters
      states[id].color = color;
      states[id].hover_color = hoverColor;
      states[id].owner = attackerEmpireId;

      // FIXED: Synchronize BOTH properties of the land shape tooltip text
      states[id].name = newEmpireLabelName;
      states[id].description = `Occupied territory of the ${newEmpireLabelName}`;

      // 2. Locate and shift regional marker flags
      const targetMarkerId = countryMarkers[id];
      if (targetMarkerId && simplemaps_europemap_mapdata.locations[targetMarkerId]) {
        const marker = simplemaps_europemap_mapdata.locations[targetMarkerId];
        marker.image_url = flagUrl || "";
        
        // FIXED: Synchronize BOTH properties of the flag marker tooltip text to exactly match the land shape
        marker.name = newEmpireLabelName;
        marker.description = `Occupied territory of the ${newEmpireLabelName}`;
      }
    }
  }

  // Synchronize canvas adjustments
  simplemaps_europemap.refresh();
  fixFlagSizesNative();
  updateLog(`🎨 Global Conquest: The ${newEmpireLabelName} has successfully integrated ${regionsConqueredCount} territories from the defeated regime!`);
}

// --- SAFETY TIMELINE HISTORY SNAPSHOT PIPELINE ---
function saveHistorySnapshot() {
  if (typeof simplemaps_europemap_mapdata === "undefined") return;
  const states = simplemaps_europemap_mapdata.state_specific;
  const locations = simplemaps_europemap_mapdata.locations;
  
  const defaultMapColor = simplemaps_europemap_mapdata.main_settings.state_color || "#7f7f7f";
  const defaultHoverColor = simplemaps_europemap_mapdata.main_settings.state_hover_color || "#999999";

  let snapshot = { states: {}, locations: {} };

  // Deep clone current land ownership matrix with strict safety fallbacks
  for (let id in states) {
    // Added 'name and description' to the state tracking snapshot block
     snapshot.states[id] = {
  color: states[id].color || defaultMapColor,
  hover_color: states[id].hover_color || defaultHoverColor,
  owner: states[id].owner || id,
  name: states[id].name || "",
  description: states[id].description || "" // <-- Ensure description is backed up!
};
  }

  // Deep clone marker flags configuration rules safely
  for (let id in countryMarkers) {
    const mId = countryMarkers[id];
    if (locations[mId]) {
      snapshot.locations[mId] = {
        image_url: locations[mId].image_url || "",
        name: locations[mId].name || "",
        description: locations[mId].description || ""
      };
    }
  }

  historyStack.push(snapshot);
  if (historyStack.length > MAX_HISTORY) historyStack.shift();
  
  redoStack = []; 
  updateHistoryButtonsUI();
}

function executeUndo() {
  if (historyStack.length === 0) return;

  const currentStateSnapshot = currentHistorySnapshotObject();
  redoStack.push(currentStateSnapshot);

  const previousState = historyStack.pop();
  applyHistorySnapshot(previousState);
  
  updateHistoryButtonsUI();
  updateLog("↩️ Undo executed: Restored previous map timeline.");
}

function executeRedo() {
  if (redoStack.length === 0) return;

  const currentStateSnapshot = currentHistorySnapshotObject();
  historyStack.push(currentStateSnapshot);

  const nextState = redoStack.pop();
  applyHistorySnapshot(nextState);

  updateHistoryButtonsUI();
  updateLog("↪️ Redo executed: Forwarded map state timeline.");
}

function currentHistorySnapshotObject() {
  const states = simplemaps_europemap_mapdata.state_specific;
  const locations = simplemaps_europemap_mapdata.locations;
  const defaultMapColor = simplemaps_europemap_mapdata.main_settings.state_color || "#7f7f7f";
  const defaultHoverColor = simplemaps_europemap_mapdata.main_settings.state_hover_color || "#999999";

  let snapshot = { states: {}, locations: {} };
  
  for (let id in states) {
    snapshot.states[id] = {
  color: states[id].color || defaultMapColor,
  hover_color: states[id].hover_color || defaultHoverColor,
  owner: states[id].owner || id,
  name: states[id].name || "",
  description: states[id].description || "" // <-- Ensure description is backed up!
};
  }
  for (let id in countryMarkers) {
    const mId = countryMarkers[id];
    if (locations[mId]) {
      snapshot.locations[mId] = { 
        image_url: locations[mId].image_url || "", 
        name: locations[mId].name || "", 
        description: locations[mId].description || "" 
      };
    }
  }
  return snapshot;
}

function applyHistorySnapshot(snapshot) {
  if (!snapshot) return;
  const states = simplemaps_europemap_mapdata.state_specific;
  const locations = simplemaps_europemap_mapdata.locations;

  for (let id in snapshot.states) {
    if (states[id]) {
  states[id].color = snapshot.states[id].color;
  states[id].hover_color = snapshot.states[id].hover_color;
  states[id].owner = snapshot.states[id].owner;
  states[id].name = snapshot.states[id].name;
  states[id].description = snapshot.states[id].description; // <-- Ensure description is restored backward!
}
  }

  for (let mId in snapshot.locations) {
    if (locations[mId]) {
      locations[mId].image_url = snapshot.locations[mId].image_url;
      locations[mId].name = snapshot.locations[mId].name;
      locations[mId].description = snapshot.locations[mId].description;
    }
  }

  simplemaps_europemap.refresh();
  fixFlagSizesNative();
}

function updateHistoryButtonsUI() {
  const undoBtn = document.getElementById("btn-undo");
  const redoBtn = document.getElementById("btn-redo");
  if (undoBtn) undoBtn.disabled = (historyStack.length === 0);
  if (redoBtn) redoBtn.disabled = (redoStack.length === 0);
}

// --- AUXILIARY ACTIONS & UTILITIES ---
function countTerritoriesOwnedBy(ownerId) {
  let count = 0;
  const states = simplemaps_europemap_mapdata.state_specific;
  for (let key in states) {
    if (states[key].owner === ownerId) count++;
  }
  return count || 1;
}

// Resets paintbrush tool settings safely
function resetSandboxBrush() {
  gameState.selectedCountry = null;
  gameState.currentBrushColor = null;
  gameState.currentBrushHoverColor = null;
  gameState.currentBrushFlag = null;

  const statusBox = document.getElementById("brush-status");
  if (statusBox) {
    statusBox.className = "status-empty";
    statusBox.innerText = "No country selected";
    statusBox.style.color = "inherit";
  }

  const clearBtn = document.getElementById("btn-clear-brush");
  if (clearBtn) {
    clearBtn.classList.add("hidden");
  }
}

function clearBattleQueue() {
  gameState.attackerId = null;
  gameState.defenderId = null;
  
  const attInput = document.getElementById("attacker-search");
  const defInput = document.getElementById("defender-search");
  if (attInput) attInput.value = "";
  if (defInput) defInput.value = "";

  const simBtn = document.getElementById("btn-simulate");
  if (simBtn) simBtn.disabled = true;
  const resCard = document.getElementById("battle-result");
  if (resCard) resCard.classList.add("hidden");
}

function fixFlagSizesNative() {
  const currentZoom = simplemaps_europemap.zoom_level || 1;
  document.querySelectorAll("#map image, .sm_location_image").forEach(img => {
    if (!img.dataset.baseSize) img.dataset.baseSize = img.getAttribute("width") || "30";
    img.setAttribute("width", parseFloat(img.dataset.baseSize) * currentZoom);
    img.setAttribute("height", parseFloat(img.dataset.baseSize) * currentZoom);
  });
}

// Global logger handler
function updateLog(text) {
  const ticker = document.getElementById("log-ticker");
  if (ticker) ticker.innerText = text;
}

window.onload = initGame;