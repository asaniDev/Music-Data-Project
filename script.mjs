import { getUserIDs } from "./data.mjs";

import {
  getUserTracks,
  getMostPlayedSongs,
  getMostPlayedArtists,
  getMostPlayedFridayNightSongs,
  getSongsByListeningTime,
  getArtistsByListeningTime,
  getFridayNightSongsByListeningTime,
  getLongestConsecutiveRun,
  getSongsPlayedEveryActiveDay,
  getTopGenres,
} from "./musicStats.mjs";

const userSelect = document.querySelector("#user-select");
const results = document.querySelector("#results");

function addList(title, items, formatItem) {
  // Hide the entire question if no result applies.
  if (items.length === 0) {
    return;
  }

  const section = document.createElement("section");
  const heading = document.createElement("h2");
  const list = document.createElement("ul");

  heading.textContent = title;

  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = formatItem(item);
    list.append(li);
  }

  section.append(heading, list);
  results.append(section);
}

function populateUsers() {
  for (const userID of getUserIDs()) {
    const option = document.createElement("option");

    option.value = userID;
    option.textContent = `User ${userID}`;

    userSelect.append(option);
  }
}

function renderUser(userID) {
  results.replaceChildren();

  if (userID === "") {
    return;
  }

  const tracks = getUserTracks(userID);

  if (tracks.length === 0) {
    results.append(
      Object.assign(document.createElement("p"), {
        textContent: "This user didn't listen to any songs.",
      }),
    );

    return;
  }

  addList(
    "Most-played song",
    getMostPlayedSongs(userID),
    (item) => `${item.title} (${item.playCount} plays)`,
  );

  addList(
    "Most-played artist",
    getMostPlayedArtists(userID),
    (item) => `${item.artist} (${item.playCount} plays)`,
  );

  addList(
    "Most-played Friday-night song",
    getMostPlayedFridayNightSongs(userID),
    (item) => `${item.title} (${item.playCount} plays)`,
  );

  addList(
    "Song with the highest listening time",
    getSongsByListeningTime(userID),
    (item) => `${item.title} (${item.totalSeconds} seconds)`,
  );

  addList(
    "Artist with the highest listening time",
    getArtistsByListeningTime(userID),
    (item) => `${item.artist} (${item.totalSeconds} seconds)`,
  );

  addList(
    "Friday-night song with the highest listening time",
    getFridayNightSongsByListeningTime(userID),
    (item) => `${item.title} (${item.totalSeconds} seconds)`,
  );

  addList(
    "Longest consecutive run",
    getLongestConsecutiveRun(userID),
    (item) => `${item.title} (${item.playCount} consecutive plays)`,
  );

  addList(
    "Songs played every active day",
    getSongsPlayedEveryActiveDay(userID),
    (item) => item.title,
  );

  addList(
    "Top genres",
    getTopGenres(userID),
    (item) => `${item.genre} (${item.playCount} plays)`,
  );
}

populateUsers();

userSelect.addEventListener("change", () => {
  renderUser(userSelect.value);
});

if (userSelect.options.length > 0) {
  renderUser(userSelect.value);
}
