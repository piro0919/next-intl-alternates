# assets

`SpaceGrotesk-700-subset.ttf` is the face drawn into the Open Graph card
(`src/app/opengraph-image.tsx`). It is the display face the site uses for its
headings, instanced at weight 700 and cut down to Latin.

Any character missing from it silently falls back to a different face, so when
the card's copy changes, rebuild the subset:

```sh
curl -sL -o /tmp/sg.ttf \
  "https://github.com/google/fonts/raw/main/ofl/spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf"
fonttools varLib.instancer /tmp/sg.ttf wght=700 -o /tmp/sg700.ttf

pyftsubset /tmp/sg700.ttf \
  --unicodes="U+0020-007E,U+00A0-00FF" \
  --output-file=assets/SpaceGrotesk-700-subset.ttf \
  --no-hinting --desubroutinize --layout-features=''
```
