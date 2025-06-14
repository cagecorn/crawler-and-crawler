// ui.js
// This thin wrapper exposes the UI helper functions that are attached to the
// global `window` object by `mechanics.js`.  The helpers are exported via both
// CommonJS and a global assignment so that tests running in Node and the browser
// code can access them without using ES module syntax.

((global) => {
    const {
        updateStats,
        updateInventoryDisplay,
        updateMercenaryDisplay,
        updateSkillDisplay,
        updateMaterialsDisplay
    } = global;

    const exportsObj = {
        updateStats,
        updateInventoryDisplay,
        updateMercenaryDisplay,
        updateSkillDisplay,
        updateMaterialsDisplay
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = exportsObj;
    } else {
        Object.assign(global, exportsObj);
    }
})(typeof globalThis !== 'undefined' ? globalThis : this);
