# confluence_map

A deep-zoom viewer for a large fantasy world map, deployed as a static site.

`big_map.png` is broken into a [Deep Zoom Image](https://en.wikipedia.org/wiki/Deep_Zoom) tile
pyramid (`public/tiles/`) and displayed with [OpenSeadragon](https://openseadragon.github.io/),
so the browser only ever loads the tiles visible at the current pan/zoom level instead of the
full-resolution image.

## Requirements

Node 22+ (Vite 8 / rolldown's optional native bindings won't install correctly on Node 21).

## Development

```sh
npm install
npm run dev
```

## Regenerating tiles

If `big_map.png` changes, regenerate the tile pyramid (requires the source PNG to exist at the
repo root — it isn't committed, since at 104MB it's over GitHub's 100MB file-size limit):

```sh
npm run tiles
```

This overwrites `public/tiles/`, which **is** committed — that's what the deployed site serves.

## Deployment

Pushes to `main` build and deploy automatically to GitHub Pages via
[.github/workflows/deploy.yml](.github/workflows/deploy.yml).
