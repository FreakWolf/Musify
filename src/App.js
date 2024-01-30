import React, { useState, useRef, useEffect } from "react";
import Nav from "./components/Nav";
import Library from "./components/Library";
import Player from "./components/Player";
import Song from "./components/Song";
import "./styles/app.scss";

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

  // Use localStorage to store and retrieve data
  useEffect(() => {
    const lastSongId = localStorage.getItem("lastSongId");
    const lastSongTime = parseFloat(localStorage.getItem("lastSongTime"));

    if (lastSongId && lastSongTime && songs.length > 0) {
      const lastSong = songs.find((song) => song.id === lastSongId);

      if (lastSong) {
        setCurrentSong(lastSong);
        audioRef.current.currentTime = lastSongTime;
      }
    }
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

    // Update localStorage with the current song and time
    if (currentSong) {
      localStorage.setItem("lastSongId", currentSong.id);
      localStorage.setItem("lastSongTime", currentTime.toString());
    }
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
      const audioURL = URL.createObjectURL(file);

      const newSong = {
        id: `upload-${Math.random()}`,
        name: file.name.replace(".mp3", ""),
        artist: "Unknown Artist",
        cover: "path/to/default/cover.jpg", // You can set a default cover image
        audio: audioURL, // Use the created URL for audio source
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
