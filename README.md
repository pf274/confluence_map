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

## Updating the map remotely (no local machine needed)

[.github/workflows/update-map.yml](.github/workflows/update-map.yml) regenerates the tiles and
deploys from just a browser:

1. Go to the repo's **Releases** page and create (or edit) a release, dragging the new
   `big_map.png` in as an asset. The default tag this workflow looks for is `map-source` — reuse
   that same release/tag each time so you don't have to specify it.
2. Go to **Actions → Update Map from Release → Run workflow**, optionally overriding the release
   tag, and run it.

The workflow downloads the asset, runs `npm run tiles`, commits the regenerated `public/tiles/`,
and deploys — all in one run.
