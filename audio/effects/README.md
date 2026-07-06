# Intro TV — sound

Drop **one** pre-mixed clip here and the intro
([`ui_kits/portfolio/IntroTV.jsx`](../../ui_kits/portfolio/IntroTV.jsx)) plays it
alongside the CRT animation. The file is optional — if it's missing the intro
just runs silently, no errors.

| File            | Plays            | Notes                                   |
| --------------- | ---------------- | --------------------------------------- |
| `tv-intro.mp3`  | intro start (0s) | one glued clip for the whole ~3.8s intro |

Glue the individual sounds (TV turn-on → static bed → spark → smoke) into this
single file, timed to the sequence:

- power-on flash ...... 0.30 s
- logo + static ....... 0.80 s
- spark crack ......... ~1.88 s
- smoke plume ......... ~2.15 s
- power-off collapse .. 2.85 s
- overlay fades out ... ~3.4–3.8 s

Path, start offset (`at`) and `volume` live in the `AK_TV_AUDIO` object near the
top of `IntroTV.jsx`.

Notes:
- Sound stops on skip (click / any key) and when the intro ends.
- Browsers block autoplay until the user interacts with the page, so on a hard
  reload the sound may be muted by the browser's autoplay policy. That's
  expected, not a bug.
