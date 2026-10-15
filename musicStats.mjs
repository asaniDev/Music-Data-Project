import { getSong, getListenEvents } from "./data.mjs";

// Get listen events and attach the matching song details.
export function getUserTracks(userID) {
  const events = getListenEvents(userID) ?? [];

  return events.flatMap((event) => {
    const song = getSong(event.song_id);

    if (!song) {
      return [];
    }

    return [{ ...event, song }];
  });
}

// Count how often a key appears.
// The key can represent a song, artist or genre.
export function countBy(items, getKey) {
  const counts = new Map();

  for (const item of items) {
    const key = getKey(item);

    if (key === null || key === undefined || key === "") {
      continue;
    }

    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return counts;
}

// Add up a numeric value for each key.
export function totalBy(items, getKey, getValue) {
  const totals = new Map();

  for (const item of items) {
    const key = getKey(item);
    const value = getValue(item);

    if (
      key === null ||
      key === undefined ||
      key === "" ||
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < 0
    ) {
      continue;
    }

    totals.set(key, (totals.get(key) ?? 0) + value);
  }

  return totals;
}

// Return all entries tied for the highest value.
function getLeaders(map, makeResult) {
  if (map.size === 0) {
    return [];
  }

  const highest = Math.max(...map.values());

  return [...map.entries()]
    .filter(([, value]) => value === highest)
    .map(([key, value]) => makeResult(key, value));
}

// 1. Most-played song by number of events.
export function getMostPlayedSongs(userID) {
  const tracks = getUserTracks(userID);
  const counts = countBy(tracks, (track) => track.song.id);

  return getLeaders(counts, (songId, playCount) => {
    const song = getSong(songId);

    return {
      songId,
      title: song.title,
      playCount,
    };
  });
}

// 2. Most-played artist by number of events.
export function getMostPlayedArtists(userID) {
  const tracks = getUserTracks(userID);
  const counts = countBy(tracks, (track) => track.song.artist);

  return getLeaders(counts, (artist, playCount) => ({
    artist,
    playCount,
  }));
}
