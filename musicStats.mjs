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

// Interpret the timestamp as the project's local date and time.
function getLocalDayOfWeek(timestamp) {
  return new Date(timestamp).getDay();
}

// 3. Events in the Friday-night window:
// Friday from 17:00, and Saturday before 04:00.
export function getFridayNightTracks(userID) {
  const tracks = getUserTracks(userID);

  return tracks.filter((track) => {
    const day = getLocalDayOfWeek(track.timestamp);
    const seconds = track.seconds_since_midnight;

    if (!Number.isFinite(seconds)) {
      return false;
    }

    const fridayEvening = day === 5 && seconds >= 17 * 60 * 60;

    const saturdayMorning = day === 6 && seconds < 4 * 60 * 60;

    return fridayEvening || saturdayMorning;
  });
}

export function getMostPlayedFridayNightSongs(userID) {
  const tracks = getFridayNightTracks(userID);
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

// 4a. Most-listened-to song by total song duration.
export function getSongsByListeningTime(userID) {
  const tracks = getUserTracks(userID);

  const totals = totalBy(
    tracks,
    (track) => track.song.id,
    (track) => track.song.duration_seconds,
  );

  return getLeaders(totals, (songId, totalSeconds) => {
    const song = getSong(songId);

    return {
      songId,
      title: song.title,
      totalSeconds,
    };
  });
}

// 4b. Most-listened-to artist by total song duration.
export function getArtistsByListeningTime(userID) {
  const tracks = getUserTracks(userID);

  const totals = totalBy(
    tracks,
    (track) => track.song.artist,
    (track) => track.song.duration_seconds,
  );

  return getLeaders(totals, (artist, totalSeconds) => ({
    artist,
    totalSeconds,
  }));
}

// 4c. Most-listened-to Friday-night song by total duration.
export function getFridayNightSongsByListeningTime(userID) {
  const tracks = getFridayNightTracks(userID);

  const totals = totalBy(
    tracks,
    (track) => track.song.id,
    (track) => track.song.duration_seconds,
  );

  return getLeaders(totals, (songId, totalSeconds) => {
    const song = getSong(songId);

    return {
      songId,
      title: song.title,
      totalSeconds,
    };
  });
}

// 5. Longest uninterrupted run of the same song.
export function getLongestConsecutiveRun(userID) {
  const tracks = getUserTracks(userID).sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
  );

  if (tracks.length === 0) {
    return [];
  }

  let currentSongId;
  let currentCount = 0;
  let longestCount = 0;
  let leaders = new Map();

  for (const track of tracks) {
    if (track.song.id === currentSongId) {
      currentCount++;
    } else {
      currentSongId = track.song.id;
      currentCount = 1;
    }

    if (currentCount > longestCount) {
      longestCount = currentCount;
      leaders = new Map([[currentSongId, track.song]]);
    } else if (currentCount === longestCount) {
      leaders.set(currentSongId, track.song);
    }
  }

  return [...leaders.entries()].map(([songId, song]) => ({
    songId,
    title: song.title,
    playCount: longestCount,
  }));
}

// 6. Songs listened to on every active listening day.
export function getSongsPlayedEveryActiveDay(userID) {
  const tracks = getUserTracks(userID);

  if (tracks.length === 0) {
    return [];
  }

  const songsByDay = new Map();

  for (const track of tracks) {
    // ISO timestamps start with YYYY-MM-DD.
    const day = track.timestamp.slice(0, 10);

    if (!songsByDay.has(day)) {
      songsByDay.set(day, new Set());
    }

    songsByDay.get(day).add(track.song.id);
  }

  const dailySets = [...songsByDay.values()];
  const [firstDay, ...otherDays] = dailySets;

  return [...firstDay]
    .filter((songId) => otherDays.every((day) => day.has(songId)))
    .map((songId) => {
      const song = getSong(songId);

      return {
        songId,
        title: song.title,
      };
    });
}

// 7. Top three genres by number of listen events.
export function getTopGenres(userID) {
  const tracks = getUserTracks(userID);
  const counts = countBy(tracks, (track) => track.song.genre);

  return [...counts.entries()]
    .map(([genre, playCount]) => ({ genre, playCount }))
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 3);
}
