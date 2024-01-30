import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMusic } from "@fortawesome/free-solid-svg-icons";

const Nav = ({ libraryStatus, setLibraryStatus, onFileChange }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    onFileChange(file);
  };

  return (
    <nav>
      <h3>Musify</h3>
      <label htmlFor="file-upload" className="upload-btn">
        Upload
        <FontAwesomeIcon icon={faMusic} />
      </label>
      <input
        type="file"
        id="file-upload"
        accept=".mp3"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <button onClick={() => setLibraryStatus(!libraryStatus)}>
        Library
        <FontAwesomeIcon icon={faMusic} />
      </button>
    </nav>
  );
};

export default Nav;
