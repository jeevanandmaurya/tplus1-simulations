<!-- tplus1:readme -->
# tplus1-simulations

Interactive simulations by [@jeevanandmaurya](https://github.com/jeevanandmaurya), made with [tplus1](https://www.tplus1.in). Every simulation steps a world from one moment, *t*, to the next, *t*+1.

- **Browse:** https://jeevanandmaurya.github.io/tplus1-simulations/ (with GitHub Pages on: Settings → Pages → deploy from this branch, root folder).
- **Play, edit, ask an agent:** open any folder on tplus1 at `https://www.tplus1.in/gh/jeevanandmaurya/tplus1-simulations/<folder>`.

## How this repository is organised

Each folder is one simulation, a self-contained web page with no build step:

```
<folder>/
  index.html   entry point
  main.js      the simulation (any other files: modules, CSS, images, data)
  style.css
  sim.json     { "title", "description", "tags", "controls" }
  thumb.jpg    optional picture for the collection page
```

Open any `<folder>/index.html` in a browser to run it. Libraries such as three.js or Rapier load from a CDN through an import map in `index.html`.

`index.html`, `README.md` and `.tplus1.json` at the top are rewritten by tplus1 whenever it saves here. To keep your own version of `index.html` or this README, remove the `tplus1` comment at its top and tplus1 will leave it alone.

## Working on it with your own tools or agents

Clone the repository and change any folder with your editor or coding agent (Claude Code, Codex, Cursor and so on), then push. On tplus1, a draft linked to a folder picks the changes up with **Pull from GitHub**; the simulation's page at `https://www.tplus1.in/gh/jeevanandmaurya/tplus1-simulations/<folder>` always shows the latest commit.

Notes for agents: keep each simulation inside its folder, keep `index.html` as the entry point, drive animation with `requestAnimationFrame`, read the quality setting from `window.tplus1.quality` ("low", "medium" or "high") when running on tplus1, and update `sim.json` when the title or controls change.

## Simulations

| Simulation | About | tplus1 |
| --- | --- | --- |
| [Ripple Tank](./ripple-tank/) | The wave equation on a grid. Two coherent sources or a double slit paint interference fringes you can disturb. | [open](https://www.tplus1.in/gh/jeevanandmaurya/tplus1-simulations/ripple-tank) |
