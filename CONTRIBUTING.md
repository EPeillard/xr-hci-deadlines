# Contributing publication venues

Suggest a venue, missing edition, updated deadline or metric through an issue or pull request. Include an official source and explain its topical scope.

## Source of truth

Edit `conferences.json`. The build generates the deployed `data.js`. Collections:

- `families`: stable conference/network IDs, name, community (`scope`), kind, clickable topic tags, scope description, indicator, historical observations and forecast.
- `editions`: exact event dates (inclusive end), location, region, official URL, last verification date, event status and contribution milestones.
- `journals`: full title, acronym, publisher, tags, scope and indicator.

Keep unrelated records intact. Use established tags when possible. Topic filters use AND matching and remain active across pages.

## Dates and precision

Use `status: verified` only for published information checked against an official source. `tentative` means explicitly provisional dates from the organizer. `estimated` means an editorial forecast.

A milestone may have an ISO 8601 `deadline` with a verified timezone offset, or a `date` when the cutoff time is unknown. AoE is UTC−12. Never substitute midnight UTC. Check required abstract registration stages separately from full submission.

Only list deadlines for initial contribution submissions: papers, required abstracts/metadata, posters/WiP, demonstrations, doctoral contributions, workshop/tutorial/panel proposals, competitions and presentation proposals. Do not add rebuttals, revised submissions, camera-ready/final versions, publication uploads, presentation material delivery, author registration, workshop website delivery or volunteer applications. Separate initial submission rounds that accept new work remain eligible. This rule applies to history, the planner, calendar and subscription data alike.

Forecasts use `{start, end, precision: month}` ranges for event and submission windows. Record the assumed recurrence, historical edition observations, source links, basis, confidence and limitations. No-history forecasts must state the broad seasonal / lead-time assumption, rather than pretending it came from multiple editions. Do not extrapolate annually for a biennial event. Conference-linked journals can have several rounds: record them separately when available.

Estimates are displayed, but never exported to ICS as exact dates. If a deadline is extended, update it and record the former date in `note`.

## Rankings and journal metrics

An `impact` entry needs `status`, `label`, `scheme`, `edition`, `source`, `checked` and an explanatory `note`. Official ICORE entries retain their release year and classification. For journals, numeric values and quartiles need the metric year/release and source. Record the category when available; a publisher’s best quartile is not every category’s quartile. JCR and SJR are separate systems.

Estimated visibility is a qualitative editorial proxy: High visibility, Specialist, National, Community or Industry. It describes audience reach and venue scope, not citation counts, selectivity or official grades. Never fabricate an impact factor, quartile or CORE rank.

## Validation

Run `node tests/check.cjs`, then `python3 scripts/build.py`. Check both pages, tag filtering, the monthly planner and small-screen horizontal table navigation in a browser. A push to `main` triggers deployment.

## Conference logos

Conference lists may show a small official visual identity next to the name. The optional family-level `logo` object records its HTTPS image `url`, official page `source`, `checked` date, and an `edition` year when edition-specific. An edition logo is a recognition aid for the series, not a claim that historical editions used the same artwork. Its year is available in the image tooltip. Only conference branding is used, not generic ACM/IEEE or sponsor logos. A favicon alone is not evidence of a conference logo: check that it actually reproduces the conference identity, rather than generic site artwork. Prefer an explicit logo in the edition header or official media assets; older edition sites can supply a recognizable identity when the latest site has none. Record that edition year.

Images load lazily from the official source, without a referrer. Missing or failed images are hidden; the conference name and link remain usable. To add or replace a logo, verify the image on the official page and update `conferences.json`, then regenerate the root `data.js`.

## Conference map

`map.html` reads upcoming announced editions directly from the same `data.js`; it does not duplicate schedules or invent forecast locations. It includes ongoing conferences through their inclusive end date, using Europe/Paris for today. Organizer-tentative dates are labeled, and month-only announcements retain their published precision.

`map-locations.js` contains city reference points from the GeoNames cities15000 dump (CC BY 4.0) and linked GeoNames records. Each point has latitude, longitude, provenance, verification date and an explicit list of matching location strings. These are city-level reference points, never precise venue coordinates. Add a sourced entry or matching location string when a new city/venue is recorded. Do not match by family ID or carry a prior edition's city forward. Unknown/country-only destinations remain in the unplaced list; an unmatched city is also shown there until its coordinates are recorded.

The map uses pinned Leaflet 1.9.4 and Leaflet.markercluster 1.5.3 assets with integrity checks, and standard OpenStreetMap tiles with visible attribution and normal browser caching. No geocoding service, API key, user geolocation or background tile prefetch is used. A readable filtered list remains available when mapping assets or tiles cannot load. Favorites use the directory's existing browser-local selection.
