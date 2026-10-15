# Music Data Project

## Aim

This project analyses music listening data for multiple users. It combines listening
events with song information to present useful summaries of each user's habits,
including:

- most-played songs and artists;
- most-played Friday-night songs;
- songs and artists with the highest listening time;
- the longest consecutive run of a song;
- songs played on every active day; and
- the user's top genres.

The project is a small browser application built with HTML, CSS, and JavaScript
modules. The sample listening data is stored locally in [`data.mjs`](./data.mjs),
so no external database or API is required.

## Requirements

- Node.js and npm, for running the test suite
- Python 3, or another local static HTTP server, for running the browser app

## Running the application

Because the application uses JavaScript module imports, serve the project through
an HTTP server rather than opening `index.html` directly as a `file://` URL.

From the project directory, run:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000/index.html](http://localhost:8000/index.html)
in a browser.

### Using the application

1. Open the profile dropdown.
2. Select a user.
3. Review the statistics displayed for that user.

User 4 has no listening events in the sample data, so selecting User 4 displays
an empty-state message:

```text
This user didn't listen to any songs.
```

To stop the local server, return to the terminal running it and press
`Ctrl+C`.

## Running the tests

Install the project dependencies:

```bash
npm install
```

Run the Vitest test suite:

```bash
npm test
```

## Project structure

| File | Purpose |
| --- | --- |
| [`index.html`](./index.html) | HTML page and application entry point |
| [`script.mjs`](./script.mjs) | Populates the user selector and renders results |
| [`data.mjs`](./data.mjs) | Provides sample users, songs, and listening events |
| [`musicStats.mjs`](./musicStats.mjs) | Calculates listening statistics |
| [`musicStats.test.mjs`](./musicStats.test.mjs) | Vitest tests for the statistics logic |
| [`common.mjs`](./common.mjs) | Shared helper functions |
| [`styles.css`](./styles.css) | Application layout and visual styles |

## Data flow

1. `script.mjs` loads the available user IDs from `data.mjs`.
2. The selected user ID is passed to functions in `musicStats.mjs`.
3. `musicStats.mjs` retrieves listening events and song details from `data.mjs`.
4. The calculated results are rendered into the `#results` section of the page.