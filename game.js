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

// Initialize Ownership Matrix on start
function initOwnershipMatrix() {
  if (typeof simplemaps_europemap_mapdata === "undefined") return;
  const states = simplemaps_europemap_mapdata.state_specific;
  for (let id in states) {
    if (!states[id].owner) {
      // At the start of the simulation, every land mass is owned by its original native team
      states[id].owner = id; 
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
        handleBattleSelection(id);
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
      // Active Attacking Empire (gameState.selectedCountry) captures Target Region (id)
      paintCountry(id, gameState.currentBrushColor, gameState.currentBrushHoverColor, gameState.currentBrushFlag, gameState.selectedCountry);
    }

    // --- MODE 2: STRUCTURAL WAR SELECTION ---
    function handleBattleSelection(id) {
      const state = simplemaps_europemap_mapdata.state_specific[id];
      if (!state) return;

      const currentOwnerId = state.owner || id; // Target the actual imperial ruler of the land mass
      const btn = document.getElementById("btn-simulate");
      const ownerHomeState = simplemaps_europemap_mapdata.state_specific[currentOwnerId] || state;

      if (!gameState.attackerId) {
        gameState.attackerId = currentOwnerId;
        document.getElementById("attacker-display").innerText = `⚔️ ${ownerHomeState.name || currentOwnerId}`;
        updateLog(`Attacker selected: ${ownerHomeState.name || currentOwnerId}. Now select target region.`);
      } 
      else if (gameState.attackerId === currentOwnerId) {
        gameState.attackerId = null;
        document.getElementById("attacker-display").innerText = "Select on map...";
        if (btn) btn.disabled = true;
      } 
      else {
        gameState.defenderId = id; // Keep targetRegionId here to identify exactly what area changes hands
        document.getElementById("defender-display").innerText = `🛡️ ${state.name || id} (${ownerHomeState.name || currentOwnerId})`;
        if (btn) btn.disabled = false; 
        updateLog(`Target territory confirmed: ${state.name || id}. Ready to simulate battle.`);
      }
    }

  }, 1500);
}

// --- CORE SIMULATION / BATTLE CALCULATION LAYER ---
function runBattleSimulation() {
  const attId = gameState.attackerId; // This is the Attacking Empire ID
  const defRegionId = gameState.defenderId; // This is the Target Region ID clicked
  
  const defState = simplemaps_europemap_mapdata.state_specific[defRegionId];
  if (!defState) return;

  const defId = defState.owner || defRegionId; // True defending Empire owning that land
  
  const attackerName = simplemaps_europemap_mapdata.state_specific[attId]?.name || attId;
  const defenderName = simplemaps_europemap_mapdata.state_specific[defId]?.name || defId;
  
  updateLog(`Simulating engagement: ${attackerName} vs ${defenderName}...`);
  
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
      
      if (btn) {
        btn.innerText = "⚡ Commencing Battle";
        btn.disabled = true;
      }
      if (resultCard) resultCard.classList.remove("hidden");
      
      if (attackerWon) {
        if (resultCard) {
          resultCard.className = "result-card win";
          resultCard.innerHTML = `<strong>VICTORY: ${attackerName} Wins!</strong><br>${defState.name || defRegionId} annexed into the empire.`;
        }
        
        // Execute structural map transfer using the Attacking Empire's original base color properties
        const attState = simplemaps_europemap_mapdata.state_specific[attId];
        paintCountry(defRegionId, attState.color, (attState.hover_color || attState.color), countryFlags[attId], attId);
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
      // Flush matching defender slots, keep attacker loaded for rapid continuation configurations
      gameState.defenderId = null;
      document.getElementById("defender-display").innerText = "Select target on map...";
    }
  }, 375);
}

// Dom Event Initialization
function setupDomEventListeners() {
  document.querySelectorAll('input[name="game-mode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
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
      updateLog(`Switched control operational framework to: ${gameState.currentMode}`);
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
}

// --- REWRITTEN PAINT CORE: SEPARATING LAND SHAPE FROM MARKER TRACKING ---
function paintCountry(targetRegionId, color, hoverColor, flagUrl, attackerEmpireId) {
  const targetState = simplemaps_europemap_mapdata.state_specific[targetRegionId];
  if (!targetState) return;

  // SAVE TIMELINE SNAPSHOT BEFORE PAINT TRANSITIONS ALTER DATA
  saveHistorySnapshot();

  // 1. Update the target land mass coordinates properties to match the conqueror
  targetState.color = color;
  targetState.hover_color = hoverColor;
  targetState.owner = attackerEmpireId; // Change the owner pointer directly to the attacker Empire ID

  const attackerName = simplemaps_europemap_mapdata.state_specific[attackerEmpireId]?.name || attackerEmpireId;

  // 2. Find the specific marker index sitting inside the TARGET LAND REGION
  // and update its visual asset link to display the conqueror's logo symbol.
  const targetMarkerId = countryMarkers[targetRegionId];
  if (targetMarkerId && simplemaps_europemap_mapdata.locations[targetMarkerId]) {
    const marker = simplemaps_europemap_mapdata.locations[targetMarkerId];
    marker.image_url = flagUrl || "";
    marker.name = `${targetState.name || targetRegionId}`;
    marker.description = `Occupied territory of the ${attackerName} Empire`;
  }

  // Synchronize canvas adjustments
  simplemaps_europemap.refresh();
  fixFlagSizesNative();
  updateLog(`🎨 ${attackerName} has successfully conquered ${targetState.name || targetRegionId}!`);
}

// --- UPDATED SAFETY TIMELINE HISTORY SNAPSHOT PIPELINE ---
function saveHistorySnapshot() {
  if (typeof simplemaps_europemap_mapdata === "undefined") return;
  const states = simplemaps_europemap_mapdata.state_specific;
  const locations = simplemaps_europemap_mapdata.locations;
  
  // Safe Map Default Fallbacks (Adjust these hex codes to your map's base theme if needed)
  const defaultMapColor = simplemaps_europemap_mapdata.main_settings.state_color || "#7f7f7f";
  const defaultHoverColor = simplemaps_europemap_mapdata.main_settings.state_hover_color || "#999999";

  let snapshot = { states: {}, locations: {} };

  // Deep clone current land ownership matrix with strict safety fallbacks
  for (let id in states) {
    snapshot.states[id] = {
      color: states[id].color || defaultMapColor,
      hover_color: states[id].hover_color || defaultHoverColor,
      owner: states[id].owner || id
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

  // 1. Capture current layout frame state and push it into the redo stack
  const currentStateSnapshot = currentHistorySnapshotObject();
  redoStack.push(currentStateSnapshot);

  // 2. Pop the prior timeline map state record out of the history stack
  const previousState = historyStack.pop();
  applyHistorySnapshot(previousState);
  
  updateHistoryButtonsUI();
  updateLog("↩️ Undo executed: Restored previous map timeline.");
}

function executeRedo() {
  if (redoStack.length === 0) return;

  // 1. Save where we are right now back into standard history stack
  const currentStateSnapshot = currentHistorySnapshotObject();
  historyStack.push(currentStateSnapshot);

  // 2. Restore the forward timeline frame index out of the redo stack
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
      owner: states[id].owner || id 
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
  document.getElementById("attacker-display").innerText = "Select on map...";
  document.getElementById("defender-display").innerText = "Select target on map...";
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

function updateLog(text) {
  const ticker = document.getElementById("log-ticker");
  if (ticker) ticker.innerText = text;
}

window.onload = initGame;