import { beforeEach, describe, expect, test, vi } from "vitest";

import { getSong, getListenEvents } from "./data.mjs";

import {
  getUserTracks,
  getMostPlayedArtists,
  getMostPlayedSongs,
} from "./musicStats.mjs";

vi.mock("./data.mjs", () => ({
  getSong: vi.fn(),
  getListenEvents: vi.fn(),
}));

const songs = {
  "song-1": {
    id: "song-1",
    artist: "The King Blues",
    title: "I Got Love",
    duration_seconds: 190,
    genre: "Punk",
  },
  "song-2": {
    id: "song-2",
    artist: "Frank Turner",
    title: "Be More Kind",
    duration_seconds: 247,
    genre: "Pop",
  },
  "song-10": {
    id: "song-10",
    artist: "Ani DiFranco",
    title: "As Is",
    duration_seconds: 246,
    genre: "Pop",
  },
};

function event(song_id, timestamp, seconds_since_midnight) {
  return {
    song_id,
    timestamp,
    seconds_since_midnight,
  };
}

beforeEach(() => {
  vi.resetAllMocks();

  getSong.mockImplementation((songID) => songs[songID]);

  getListenEvents.mockReturnValue([]);
});

describe("getUserTracks", () => {
  test("attaches song details to each event", () => {
    getListenEvents.mockReturnValue([
      event("song-1", "2024-08-01T10:00:00", 36000),
    ]);

    expect(getUserTracks("1")).toEqual([
      {
        ...event("song-1", "2024-08-01T10:00:00", 36000),
        song: songs["song-1"],
      },
    ]);
  });

  test("skips events whose song details are missing", () => {
    getListenEvents.mockReturnValue([
      event("song-missing", "2024-08-01T10:00:00", 36000),
    ]);

    expect(getUserTracks("1")).toEqual([]);
  });
});
