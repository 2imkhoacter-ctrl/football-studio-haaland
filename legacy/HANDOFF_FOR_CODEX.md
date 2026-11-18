# Football Studio — handoff notes (for Codex / GPT)

Single-file offline tool: `football-studio.html` (vanilla JS + SVG, no libraries). It builds a 2D cartoon footballer
that can be posed, turned 360 degrees, recoloured, reshaped, animated with keyframes, and exported as transparent PNG.
Heads are cartoon PNGs made by GPT; the body is code-drawn flat shapes.

## Folder layout (copy ALL of it together)
```
football-studio.html
data/heads/haaland_front.png, _q45.png, _side.png, _q135.png, _back.png   (512x512, transparent)
data/characters/haaland.json     (default tuned values for Haaland: body, look, head, one saved pose)
```
Serve over http (e.g. `py -m http.server 8765`) so the heads/character file load (file:// blocks fetch).
Add `?nosave` to the URL to run WITHOUT reading/writing the user's saved state (use this for testing).

## USER'S HARD RULES (they were burned before)
1. NEVER reset the user's tuned values. Settings autosave to localStorage key `fs_state_v2`; first run uses `data/characters/haaland.json`.
   Do not change defaults/DEF_BODY in a way that overrides saved state. Test only with `?nosave` in a separate tab.
2. User speaks Vietnamese; keep UI labels in Vietnamese.
3. Keep the "no hacks" rule: general solutions that work for any player, not tuned for Haaland.
4. The user has little budget: be efficient, verify visually once, avoid long explanations.

## Architecture (inside the IIFE)
- State `S`: `pose` {hip, type, rotFine, yaw, limbs{hL,hR,fL,fR: [x,y,z] offset from shoulder/hip in the BODY frame}, poles}, `body` (all proportions),
  `look` (name, number, colours), `head` (images front/q45/side/q135/back, size, sink, rot, yaw, x, y), `library` (saved poses), `keys` (keyframes), `bodyLocked`.
- 3D idea: limbs are solved in the body's own 3D frame with two-bone IK (`ik3`, `solve`), then projected (`project`) using body yaw. Bones never stretch.
- `render()` rebuilds `#fig` SVG every time. Layers via `drawLayer([...])`: all outlines first (thin, OW=1.6), then all fills, so overlapping parts merge.
  A single SVG filter `#rim` on `#fig` adds ONE even outer outline around the silhouette. Handles are in `#handles` (not exported).
- Head: 5 drawn views, nearest to the turn angle is used (mirrored for left). Neck is auto-measured per image (`measureNeck`) and aligned to the body neck;
  head is drawn BEHIND the shirt; shirt top has an adjustable neck hole (holeW front, holeS side, holeD depth).
- Torso is split into chest / waist / hips, each with its own width and side-view thickness (`depthK`, `depthW`, `depthH`), plus shoulder top (`shW`, `depthS`).
- Shirt number is a decal: it slides and is squeezed with the turn, hidden edge-on; name + number on the back.
- Shorts = waist piece + two leg tubes that start INSIDE the pelvis; thighs start inside too.
- `body.gap` + lock button: lower body (shorts+legs) can move up/down relative to the shirt when unlocked.
- Keyframes: `S.keys` (full pose per time), interpolation with easing in `poseAt`, playback in `tick`, optional idle breathing/head sway.

## Known problems / TODO (user is not fully happy yet)
1. Outlines/overlaps still look wrong in some poses (thigh/hip joints, shorts vs shirt, arm over torso). User asked how games do it:
   real 2D rigs use per-part hand-drawn art with baked-in outlines, overlap zones and draw-order per pose, and mesh bending at joints.
   Suggestion: either (a) per-part sprites with baked outlines + explicit overlaps, or (b) keep procedural but define a clean draw-order table per view.
2. "Hollow shirt": lower body can be moved out of the shirt (gap shows background). Not done: dark inner lining of the shirt hem when seen from the side.
3. Legs are forced under the shirt unless a leg reaches > 115 units towards the viewer (see `isFront`). Revisit if kicks toward the camera look wrong.
4. Video export is NOT implemented. Plan: render each frame to transparent PNG into a folder chosen with `showDirectoryPicker`, then `ffmpeg -framerate 30 -i %05d.png`.
   Browser downloads were blocked in the preview pane used so far, so this must be tested in real Chrome.
5. Facial expressions / blinking / mouth movement: needs extra head images from GPT (e.g. `haaland_front_shock.png`, mouth open, eyes closed). Loader naming idea: `<name>_<view>_<expression>.png`.
6. More poses: put them in `data/poses/*.json` (pose + headYaw/headRot) instead of memory; plus a character profile file per character (`data/characters/<name>.json`) — Haaland's already exists.
7. Idea the user liked: the reference channel "Footballflipbook7" uses frame-by-frame caricature drawings. For expressive reaction poses it may be better to have GPT draw the full body per pose (same style as the heads) and flip between images; keep this tool for pitch positioning and simple motion.

## Style decisions already made (keep)
Flat colours, thick uniform black outline look (Family Guy-like). Heads come from GPT in that style. Body stays simple geometric shapes. 
Real-player likeness is stylised cartoon only; the user decided to use player-based cartoon faces.
