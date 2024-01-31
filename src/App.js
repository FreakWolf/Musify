// App.js

import React, { useState, useRef, useEffect } from "react";
import Nav from "./components/Nav";
import Library from "./components/Library";
import Player from "./components/Player";
import Song from "./components/Song";
import "./styles/app.scss";
import logo from "./logo.png"

function App() {
  const audioRef = useRef(null);
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [songInfo, setSongInfo] = useState({
    currentTime: 0,
    duration: 0,
    animationPercentage: 0,
  });
  const [libraryStatus, setLibraryStatus] = useState(false);
  const saveSongsToIndexedDB = async (songsToSave) => {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const objectStore = transaction.objectStore(STORE_NAME);

      objectStore.clear();

      songsToSave.forEach((song) => {
        const request = objectStore.add(song);

        request.onsuccess = (event) => {
          resolve("Songs saved to IndexedDB");
        };

        request.onerror = (event) => {
          reject("Error saving songs to IndexedDB");
        };
      });
    });
  };

  // Load songs from IndexedDB on initial render
  useEffect(() => {
    const loadSongsFromIndexedDB = async () => {
      try {
        const savedSongs = await loadSongs();
        if (savedSongs && savedSongs.length > 0) {
          setSongs(savedSongs);
          setCurrentSong(savedSongs[0]); // Set the current song to the first one in the list
        }
      } catch (error) {
        console.error("Error loading songs from IndexedDB:", error);
      }
    };

    loadSongsFromIndexedDB();
  }, []);

  useEffect(() => {
    // Save songs to IndexedDB whenever the songs state changes
    saveSongsToIndexedDB(songs);
  }, [songs]);

  const timeUpdateHandler = (e) => {
    const currentTime = e.target.currentTime;
    const duration = e.target.duration;

    const roundedCurrent = Math.round(currentTime);
    const roundedDuration = Math.round(duration);
    const animation = Math.round((roundedCurrent / roundedDuration) * 100);

    setSongInfo({
      ...songInfo,
      currentTime,
      duration,
      animationPercentage: animation,
    });
  };

  const activeLibraryHandler = (nextPrev) => {
    const newSong = songs.map((song) => {
      if (song.id === nextPrev.id) {
        return {
          ...song,
          active: true,
        };
      } else {
        return {
          ...song,
          active: false,
        };
      }
    });
    setSongs(newSong);
  };

  const songEndHandler = async () => {
    const currentIndex = songs.findIndex((song) => song.id === currentSong.id);
    await setCurrentSong(songs[(currentIndex + 1) % songs.length]);
    activeLibraryHandler(songs[(currentIndex + 1) % songs.length]);

    audioRef.current.addEventListener("canplaythrough", () => {
      if (isPlaying) audioRef.current.play();
    });
  };

  const handleFileChange = (file) => {
    const reader = new FileReader();

    reader.onload = () => {
      const newSong = {
        id: `upload-${Math.random()}`,
        name: file.name.replace(".mp3", ""),
        cover: logo,
        audio: reader.result,
        active: false,
      };

      setSongs([...songs, newSong]);
      setCurrentSong(newSong);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className={`App ${libraryStatus ? "library-active" : ""}`}>
      <Nav
        libraryStatus={libraryStatus}
        setLibraryStatus={setLibraryStatus}
        onFileChange={handleFileChange}
      />
      {currentSong && <Song currentSong={currentSong} />}
      <Player
        currentSong={currentSong}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        songInfo={songInfo}
        setSongInfo={setSongInfo}
        audioRef={audioRef}
        songs={songs}
        setCurrentSong={setCurrentSong}
        activeLibraryHandler={activeLibraryHandler}
      />
      <Library
        songs={songs}
        setSongs={setSongs}
        setCurrentSong={setCurrentSong}
        audioRef={audioRef}
        isPlaying={isPlaying}
        libraryStatus={libraryStatus}
      />
      <audio
        onTimeUpdate={timeUpdateHandler}
        onLoadedMetadata={timeUpdateHandler}
        onEnded={songEndHandler}
        ref={audioRef}
        src={currentSong ? currentSong.audio : null}
      ></audio>
    </div>
  );
}

export default App;

// Functions for IndexedDB

const DB_NAME = "songDatabase";
const STORE_NAME = "songsStore";

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = (event) => {
      reject("Error opening database");
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
      store.createIndex("id", "id", { unique: true });
    };
  });
};

const loadSongs = async () => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const objectStore = transaction.objectStore(STORE_NAME);

    const request = objectStore.getAll();

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject("Error loading songs from IndexedDB");
    };
  });
};

const saveSongsToIndexedDB = async () => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const objectStore = transaction.objectStore(STORE_NAME);

    objectStore.clear();

    Song.forEach((song) => {
      const request = objectStore.add(song);

      request.onsuccess = (event) => {
        resolve("Songs saved to IndexedDB");
      };

      request.onerror = (event) => {
        reject("Error saving songs to IndexedDB");
      };
    });
  });
};
