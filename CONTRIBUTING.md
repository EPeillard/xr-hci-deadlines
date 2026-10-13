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

Forecasts use `{start, end, precision: month}` ranges for event and submission windows. Record the assumed recurrence, historical edition observations, source links, basis, confidence and limitations. No-history forecasts must state the broad seasonal / lead-time assumption, rather than pretending it came from multiple editions. Do not extrapolate annually for a biennial event. Conference-linked journals can have several rounds: record them separately when available.

Estimates are displayed, but never exported to ICS as exact dates. If a deadline is extended, update it and record the former date in `note`.

## Rankings and journal metrics

An `impact` entry needs `status`, `label`, `scheme`, `edition`, `source`, `checked` and an explanatory `note`. Official ICORE entries retain their release year and classification. For journals, numeric values and quartiles need the metric year/release and source. Record the category when available; a publisher’s best quartile is not every category’s quartile. JCR and SJR are separate systems.

Estimated visibility is a qualitative editorial proxy: High visibility, Specialist, National, Community or Industry. It describes audience reach and venue scope, not citation counts, selectivity or official grades. Never fabricate an impact factor, quartile or CORE rank.

## Validation

Run `node tests/check.cjs`, then `python3 scripts/build.py`. Check both pages, tag filtering, the monthly planner and small-screen horizontal table navigation in a browser. A push to `main` triggers deployment.
