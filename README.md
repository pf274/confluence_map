# confluence_map

A deep-zoom viewer for a large fantasy world map, deployed as a static site.

`big_map.png` is broken into a [Deep Zoom Image](https://en.wikipedia.org/wiki/Deep_Zoom) tile
pyramid (`public/tiles/`) and displayed with [OpenSeadragon](https://openseadragon.github.io/),
so the browser only ever loads the tiles visible at the current pan/zoom level instead of the
full-resolution image.

Visitors can also drop points of interest on the map — right-click a blank spot to create one,
click an existing marker to view or edit it. See [Points of interest](#points-of-interest) below
for how those changes get published.

## Requirements

Node 22+ (Vite 8 / rolldown's optional native bindings won't install correctly on Node 21).

## Development

```sh
npm install
npm run dev
```

## Regenerating tiles locally

If `big_map.png` changes, regenerate the tile pyramid (requires the source PNG to exist at the
repo root — it isn't committed, since at 104MB it's over GitHub's 100MB file-size limit):

```sh
npm run tiles
```

This overwrites `public/tiles/`, which **is** committed — that's what the deployed site serves.
Commit and push it like any other change to trigger a deploy (see below).

## Points of interest

Points of interest live in [src/data/pois.json](src/data/pois.json), bundled into the site at
build time — there's no backend. Editing happens client-side and is published through a GitHub
Action:

- **Right-click** a blank spot on the map to create a new POI; **click** an existing marker to
  view it, with an **Edit** button to change its title/description/visibility threshold.
- Saved changes are held locally (in `localStorage`, so a refresh won't lose them) until you
  publish them. A pencil icon appears in the bottom-right once there's at least one unpublished
  change, badged with the count.
- Clicking the pencil opens a **Copy to Clipboard** modal. Copying hands off to GitHub — see
  `save-pois.yml` below — and clears the local pending changes.

Note that running a GitHub Action requires repo write access, so in practice this is a "friends
propose edits, you paste them in and run the Action" flow rather than something every visitor can
complete themselves.

## GitHub Actions

Three workflows handle deployment, covering the ways you'll change this site.

### [deploy.yml](.github/workflows/deploy.yml) — deploy on push

Runs automatically on every push to `main`. Builds the site with `npm run build` and publishes
`dist/` to GitHub Pages. This is what fires for ordinary code changes (or after you've committed
regenerated tiles yourself, per the section above) — you don't need to do anything beyond
`git push`.

### [update-map.yml](.github/workflows/update-map.yml) — update the map from a browser

For replacing the map image itself without a local checkout — e.g. from a phone or someone
else's machine. `big_map.png` is too large to pass as a workflow input or commit directly, so
this workflow pulls it from a GitHub Release asset instead:

1. Go to the repo's **Releases** page and create (or edit) a release, dragging the new
   `big_map.png` in as an asset. The default tag this workflow looks for is `map-source` — reuse
   that same release/tag every time so you don't have to specify it in step 2.
2. Go to **Actions → Update Map from Release → Run workflow**, optionally overriding the release
   tag, and run it.

That single run downloads the asset, runs `npm run tiles`, commits the regenerated
`public/tiles/`, builds, and deploys — it does not rely on `deploy.yml` picking up its commit,
since a push made by a workflow's own token doesn't trigger other workflows.

### [save-pois.yml](.github/workflows/save-pois.yml) — publish points of interest

Paste the JSON copied from the site's save modal (see [Points of interest](#points-of-interest)
above) into **Actions → Save POIs → Run workflow**'s `pois_json` field and run it. It validates
and writes `src/data/pois.json`, commits, builds, and deploys — same self-contained shape as
`update-map.yml`, for the same reason.
