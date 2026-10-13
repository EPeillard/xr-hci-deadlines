# HCI & XR Publication Venues

A compact English directory of conferences and journals in human-computer interaction, extended reality and adjacent research. Published at https://epeillard.github.io/xr-hci-deadlines/.

## Pages

- **Conferences** (`index.html`): conference list, upcoming submission milestones and a monthly planner. Includes French, European and international venues.
- **Journals** (`journals.html`): full journal titles, publisher, topic tags, impact factors / quartiles where verified, and explicitly marked qualitative visibility estimates elsewhere.

Topic tags filter directly. Multiple topics use AND matching. Navigation between the pages retains the selected topics. Other controls include text search, scope / location / contribution filters, verified-versus-estimated indicators, sorting and browser-local favorites.

## Data and evidence

`conferences.json` is the authoritative source. As of 13 October 2026: 39 conference families / research networks, 17 sourced conference editions (including organizer-tentative schedules), and 18 journals. Each official classification or metric has a source and edition/year. Historical observations and forecast reasoning are recorded per conference.

**Rankings:** ICORE 2026 classifications are recorded where verified. Non-grade classifications, such as National or Journal Published, retain that distinction. A conference rank is not a rank of each paper, poster or associated journal. Journal JIF values and quartiles are publisher-reported; quartiles require a category/database/year. Where no numerical metric was verified, estimated visibility is qualitative, never an invented JIF, CORE letter or quartile.

**Schedules:** exact published dates remain distinct from organizer-tentative dates and editorial estimated month ranges. Forecasts use observed submission / event months and an annual or biennial recurrence. One-edition predictions allow one extra month either side; sparse histories use explicitly described seasonal or broad lead-time assumptions. No specific day, location, call or edition is claimed to be announced merely because it is estimated. Details expose the historical source, basis and confidence. The forecast is planning guidance, not a statistical prediction or deadline guarantee.

Some sources publish a date without a cutoff time; these entries retain date-only precision. Exact deadlines preserve a timezone offset and display in Europe/Paris. Calendar exports contain verified dates only and exclude estimated and tentative dates. Exports are snapshots, not subscriptions. Sources and estimates require ongoing curation; no unattended updates are configured.

## Development

No frontend dependencies. Build and checks use Python and Node:

```sh
node tests/check.cjs
python3 scripts/build.py
python3 -m http.server 8000 --directory dist
```

The root `data.js` is a generated snapshot for direct local opening. The build regenerates the deployed `dist/data.js` from `conferences.json`.

GitHub Pages uses `.github/workflows/pages.yml`. Tests and build run on `main`, then the two-page site deploys automatically. Pages must use **GitHub Actions** as its publishing source.

See [CONTRIBUTING.md](CONTRIBUTING.md) for data maintenance. MIT license. The initial inspiration was [mkono505/hcideadlines](https://github.com/mkono505/hcideadlines); this implementation does not copy its historical content or code.
