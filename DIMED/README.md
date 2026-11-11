# DIMED project page

Static page (no build step) for https://antigravity-tech.github.io/DIMED/.

Deploy: copy the contents of this folder into the `DIMED/` directory of
https://github.com/antigravity-tech/antigravity-tech.github.io and push; GitHub Pages serves it at `/DIMED/`.
All links are relative, so the page works from that sub-directory. Open `index.html` directly, or preview with `python -m http.server` in this folder.

- `index.html`, `style.css`: the page.
- `table.js`: sortable and filterable main table; data in `assets/table2.js` (`window.TABLE2`), made from the `table2` key of
  `analysis/reproduce_main_numbers.py --json` in the code repository (`assets/table2.json` is the same data as JSON).
- `interactive.js`: the distance quiz, the drag-to-compare slider, the model x dataset heatmap and the all-11-fail viewer.
- `assets/quiz*`: the HAMMER pair used by the quiz and slider (scene5_traj2 frame 160, MoGe-2 without intrinsics, re-inferred with the paper's pipeline; `quiz.js` holds the medians and δ1).
- `assets/heatmap.js`: failure rate and bias per model x dataset, from `analysis/load_results.py` (same numbers as Tables E.1-E.7).
- `assets/wall/`: 16 shared-failure images (0–5: no size cue, all 11 architectures fail; 6–15: scale cues in view, 6–10 of 11 fail), with K; input, ground truth and each model's prediction on one colour scale per image, `wall.json`/`wall.js` with the stored δ1 and s*; produced by `scripts/vis_web_wall.py` (local, not in the code repository).
- `assets/*.svg`: the paper's charts (Figures 2, 6, 7), converted from the vector PDFs in `paper/figures/pdf/` with PyMuPDF (`page.get_svg_image(text_as_path=True)`), so they stay sharp at any zoom.

Before publishing, fill in the placeholders in `index.html` (search for `{{`): authors, affiliations, arXiv link and id, BibTeX key. Data links point to https://huggingface.co/datasets/hljiang/DIMED.
