# HEXOVERRIDE split refactor

This is a structural split of the original `UpdatedPeople.jsx` into modules.

## Files
- `src/HEXOVERRIDE.jsx` – main game component
- `src/constants/gameConstants.js` – constants, colors, registries, market pricing
- `src/ai/agents.js` – AI/Gemini helpers and org generation
- `src/ai/director.js` – adaptive difficulty logic
- `src/world/generation.js` – target/world generation
- `src/components/TerminalBits.jsx` – SyntaxText, Typewriter, HelpPanel
- `src/components/RigDisplay.jsx`
- `src/components/NetworkMap.jsx`
- `src/components/Header.jsx`
- `src/components/ContractBoard.jsx`
- `src/components/MarketBoard.jsx`
- `src/components/DarknetShop.jsx`

## Note
The original source appears to reference `generateInterceptedComms(targetIP)` inside the `ettercap` command handler, but that function is not present in the uploaded file. That unresolved reference was preserved as-is so behavior matches the source you provided.
