# Crayon background source

`crayon-a.html` → `images/crayon-menu.png` (the #menu section wave)
`crayon-b.html` → `images/crayon-testimonials.png` (the #testimonials section wave)

These hold the original SVG `feTurbulence` filter. They are rendered to a static
PNG so the browser doesn't recompute the filter on scroll (it stuttered on
mobile). Not part of the deployed page — reference only.

## Regenerate

```
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars \
  --default-background-color=00000000 --force-device-scale-factor=1 \
  --window-size=1440,640 --screenshot=../images/crayon-menu.png \
  "file://$PWD/crayon-a.html"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars \
  --default-background-color=00000000 --force-device-scale-factor=1 \
  --window-size=1440,640 --screenshot=../images/crayon-testimonials.png \
  "file://$PWD/crayon-b.html"
```

Then bump `?v=` on the two `background-image` URLs in `style.css`.
