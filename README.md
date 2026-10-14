# HCI & XR Publication Venues

A compact English directory of conferences and journals in human-computer interaction, extended reality and adjacent research. Published at https://epeillard.github.io/xr-hci-deadlines/.

## Pages

- **Conferences** (`index.html`): a conference directory, an upcoming submission planner and a monthly calendar. Includes French, European and international venues.
- **Journals** (`journals.html`): full journal titles, publisher, topic tags, impact factors / quartiles where verified, and explicitly marked qualitative visibility estimates elsewhere.

Topic tags filter directly. Multiple topics use AND matching. Navigation between the pages retains the selected topics. Other controls include text search, scope / location / contribution filters, verified-versus-estimated indicators, sorting and browser-local favorites.

## Data and evidence

`conferences.json` is the authoritative source. As of 13 October 2026: 40 conference families / research networks, 64 sourced conference editions (including organizer-tentative schedules), and 18 journals. Each official classification or metric has a source and edition/year. Historical observations and forecast reasoning are recorded per conference.

**Rankings:** ICORE 2026 classifications are recorded where verified. Non-grade classifications, such as National or Journal Published, retain that distinction. A conference rank is not a rank of each paper, poster or associated journal. Journal JIF values and quartiles are publisher-reported; quartiles require a category/database/year. Where no numerical metric was verified, estimated visibility is qualitative, never an invented JIF, CORE letter or quartile.

**Schedules:** exact published dates remain distinct from organizer-tentative dates and editorial estimated month ranges. Forecasts use observed submission / event months and an annual or biennial recurrence. One-edition predictions allow one extra month either side; sparse histories use explicitly described seasonal or broad lead-time assumptions. No specific day, location, call or edition is claimed to be announced merely because it is estimated. Details expose the historical source, basis and confidence. The forecast is planning guidance, not a statistical prediction or deadline guarantee.

Some sources publish a date without a cutoff time; these entries retain date-only precision. Exact deadlines preserve a timezone offset and display in Europe/Paris. Calendar exports contain confirmed and organizer-announced tentative dates, labeled with [Tentative] and iCalendar STATUS:TENTATIVE where applicable. Estimates and periods without precise days are excluded. Exports are snapshots, not subscriptions. Sources and estimates require ongoing curation; a ChatGPT scheduled task checks official conference sources each morning and publishes validated data changes through the connected GitHub plugin.

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

### Historical editions

Use **History** to browse past editions by year, location and topic. The calendar year selector includes historical years and automatically shows past dates for a past calendar year. Historical calls retain the published timezone and extensions where verified. Missing deadlines are explicitly unknown; missing editions do not imply cancellation. The current ICORE badge is not a retrospective rank. Historical date sources can differ from the original edition URL.

Forecasts for families with new archive observations use the latest three verified editions since 2023: a month envelope expanded by one month, preserving the submission year offset. These are planning windows, not statistical confidence intervals. Earlier dates remain accessible in History and do not bias a modern forecast.


### Directory and submission planner

**Conference directory** helps choose a venue: one profile per family, scope, topics, current indicator, recurrence and observed event/submission months from up to three editions. It is alphabetical by default, with a ranking sort. Location filters match any recorded edition; submission-specific controls are hidden. Details retain the full edition history and evidence.

**Upcoming deadlines** helps plan a submission: one row per future contribution milestone, nearest first, with time remaining, deadline precision, contribution type and event location. Past dates are always excluded here, even when enabled in the calendar. Forecast windows distinguish “window in progress” from a confirmed countdown. Date-only milestones never invent a cutoff hour.

## Favorite calendar subscriptions

Star conferences and select **Subscribe to favorites**. Paste the generated HTTPS URL into Google Calendar’s “From URL”, Apple Calendar’s “New Calendar Subscription”, or Outlook’s “Subscribe from web”. This subscribes to a live feed; downloading and importing an ICS file is a one-time snapshot.

Favorites stay in browser local storage. The link encodes a fixed set of conference-family IDs (journal favorites and directory filters are ignored). Updates and new editions for those families appear automatically when the calendar app refreshes. Changing the selected families requires a new URL and replacing the old subscription.

The public read-only feed is hosted at https://xr-hci-calendar-feed.jocundsnipe3.chatgpt.site/calendar.ics?conferences=vr,eurographics . It reads the published conferences.json on each request, with a five-minute client cache. It includes recorded confirmed and organizer-announced tentative event dates and submission milestones, including past editions. Tentative entries carry [Tentative] in their titles and STATUS:TENTATIVE; later confirmation updates the same UID. Estimates and periods without precise days are excluded. It uses stable event UIDs, UTC deadlines, date-only all-day events, exclusive conference end dates, UTF-8 line folding, and content ETags. Upstream errors return 503 rather than an empty calendar, so temporary outages do not silently remove events. Calendar clients control refresh cadence.

Feed source is maintained in the **HCI & XR Calendar Feed** Sites project (`appgprj_6ace6c26b9788191bd3ff142010e7d61`). GitHub Pages serves the directory; the separate server is required because Pages cannot dynamically filter an ICS response by URL parameters.
