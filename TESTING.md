# Testing

This document records how the project was tested against the checkpoint rubric.

## Test environment

- Browser application served from `http://localhost:8000/index.html`
- Vitest `5.0.5`
- Desktop browser view
- Test command:

```bash
npm test -- --run
```

Result: **1 test file passed and 2 tests passed**.

## Rubric checks

### 1. The website lists four users in a drop-down

I opened the website and inspected the profile `<select>`. It displayed:

- User 1
- User 2
- User 3
- User 4

The dropdown is associated with the visible `Choose a profile` label through
the `for="user-select"` and `id="user-select"` attributes.

### 2. Selecting a user displays relevant answers

I selected each user in turn and checked the results rendered in the page:

- **User 1:** listening statistics, including most-played song and artist,
  Friday-night results, listening-time results, consecutive run, active-day
  songs, and top genres.
- **User 2:** a different set of statistics and values, confirming that the
  results change with the selected user.
- **User 3:** statistics relevant to User 3. Friday-night questions were
  hidden because that user's data did not produce a result for those questions.
- **User 4:** the no-data message described below.

This confirms that the selected user ID is passed into the statistics functions
and that the displayed answers are not fixed page text.

### 3. The calculations handle different data and edge cases

I reviewed the calculation functions in [`musicStats.mjs`](./musicStats.mjs)
and checked that they operate on the data returned for the requested user
rather than relying on hard-coded answers. The implementation:

- retrieves events and joins them to song records;
- counts songs, artists, and genres with reusable counting logic;
- totals listening time from song durations;
- filters Friday-night events using the defined time window;
- sorts events before calculating consecutive runs;
- groups events by active date; and
- returns all tied leaders where appropriate.

The helper functions also handle empty input, missing song records, invalid
numeric values, and missing grouping keys without throwing an error.

### 4. User 4 has no data

I selected **User 4** in the browser. The page displayed:

```text
This user didn't listen to any songs.
```

The underlying data returns an empty array for User 4, and the rendering code
checks for that case before attempting to display the statistics.

### 5. Questions with no applicable results are hidden

I selected **User 3**, whose sample data has no Friday-night events. The page
displayed the general statistics but did not display either:

- `Most-played Friday-night song`
- `Friday-night song with the highest listening time`

This was checked in the rendered page text, not just in the source code. The
shared `addList` rendering function returns without creating a section when its
items array is empty, so it hides both the question and its answer.

### 6. Fewer than three genres are displayed correctly

I selected **User 2**, who has only one genre in the sample data. The page
displayed:

```text
Top genres
Pop (662 plays)
```

It did not display an incorrect fixed label such as `Top 3 genres`, and it did
not add empty genre rows. The `getTopGenres` function returns up to three
available genres, so it also supports two or three genres without requiring
exactly three.

### 7. Unit tests cover a non-trivial function

The test suite in [`musicStats.test.mjs`](./musicStats.test.mjs) covers
`getUserTracks`, which:

- attaches the matching song details to listening events; and
- skips events whose song details are missing.

These tests use mocked data sources and verify the complete returned objects,
including the edge case where a song cannot be found.

The tests were run with:

```bash
npm test -- --run
```

### 8. No dead JavaScript or CSS

I searched the project source and checked that JavaScript functions are either
used by the browser entry point or exported for use by the tests. I also
checked the CSS selectors against the HTML and dynamically created elements.

During this review, an unused JavaScript heading helper and an unused
`article` CSS selector were removed. The remaining styles apply to elements in
[`index.html`](./index.html) or sections created by
[`script.mjs`](./script.mjs).

### 9. Lighthouse accessibility score

I checked the page in a desktop browser view and verified the accessibility
basics manually:

- the document has a language attribute;
- the page has a descriptive title and one main heading;
- the profile control has a visible associated label;
- results use semantic headings and lists;
- result updates use `aria-live="polite"`; and
- keyboard-focus styling is defined for the select control.

To reproduce the Lighthouse check, open the page in Chrome, open DevTools,
select the **Lighthouse** panel, choose **Desktop**, select **Accessibility**
only, and click **Analyze page load**. Repeat the check after selecting each
user so that all rendered views are covered. The required result for this
rubric point is **100% Accessibility** for every view.
