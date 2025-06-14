// ui.js
// This thin wrapper re-exports the UI helper functions that are defined in
// mechanics.js.  mechanics.js attaches these helpers to the global `window`
// object, so we expose them as ES module exports so that other modules can
// import them normally.

const {
    updateStats,
    updateInventoryDisplay,
    updateMercenaryDisplay,
    updateSkillDisplay,
    updateMaterialsDisplay
} = window;

export {
    updateStats,
    updateInventoryDisplay,
    updateMercenaryDisplay,
    updateSkillDisplay,
    updateMaterialsDisplay
};
