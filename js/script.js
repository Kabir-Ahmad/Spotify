let card = document.querySelector(".cards");
let cardContainer = document.querySelector(".card-container");
let play = document.querySelector(".play");
let prev = document.querySelector("#previous");
let play_music = document.querySelector("#play_music");
let next = document.querySelector("#next");
let forward = document.querySelector(".forward");
let backward = document.querySelector(".backward");
let hamburger = document.querySelector(".hamburger");
let close = document.querySelector(".close");
let left = document.querySelector(".left");

let songs;
let currFolder;

hamburger.addEventListener("click", () => {
  left.style.left = "0%";
});
close.addEventListener("click", () => {
  left.style.left = "-110%";
});

// convert seconds to minutes
function convertSecondsToMinutesAndSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  seconds = Math.max(0, seconds);

  var minutes = Math.floor(seconds / 60);
  var remainingSeconds = Math.floor(seconds % 60);

  var formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
  var formattedSeconds =
    remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

  return formattedMinutes + ":" + formattedSeconds;
}

// fetch songs and append in library
async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  // Show all the songs in the playlist
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
           <div class="s_info">
             <img class="invert" src="img/music.svg" alt="image for music" />
             <div class="info">
               <div>${song.replaceAll("%20", " ")}</div>
               <div class="artist text-secondary">Kabir</div>
             </div>
           </div>
           <img
             class="invert"
             src="img/play.svg"
             alt="image for play button"
            />
        </li>`;
  }

  // Attach an event listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs;
}

let currentSong = new Audio();

// play songs and update playbar according to song
const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (pause) {
    currentSong.play();
  }
  play_music.src = "img/play.svg";
  document.querySelector(".songInfo").innerHTML = decodeURI(track);

  currentSong.addEventListener("timeupdate", () => {
    let currTime = convertSecondsToMinutesAndSeconds(currentSong.currentTime);
    let duration = convertSecondsToMinutesAndSeconds(currentSong.duration);

    document.querySelector(".songTime").innerHTML = currTime + "/" + duration;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
    if (currTime == duration) {
      play_music.src = "img/play.svg";
    }
  });
};

// display albums dynamically
async function displayAlbums() {
  let a = await fetch(`http://192.168.100.3:3000/songs/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.classList.add("d-none");
  cardContainer.before(div);
  div.innerHTML = response;

  let anchors = div.getElementsByTagName("a");
  let array = Array.from(anchors);

  for (let i = 0; i < array.length; i++) {
    let e = array[i];
    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];
      let a = await fetch(
        `http://192.168.100.3:3000/songs/${folder}/info.json`
      );
      let response = await a.json();

      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="cards text-light px-3 m-2">
      <div class="play">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="11" cy="12" r="11" fill="#1ed760" />
          <path d="M9 16.5V7.5L15 12L9 16.5Z" fill="#000" />
        </svg>
      </div>
      <img
        src="songs/${folder}/cover.jpg"
        alt="image for card"
      />
      <div class="card-body d-flex flex-column pb-2">
        <h5 class="card-title">${response.title}</h5>
        <p class="card-text">
          ${response.description}
        </p>
      </div>
      </div>`;
    }
  }

  Array.from(document.getElementsByClassName("cards")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      const folder = item.currentTarget.dataset.folder;
      let songs = await getSongs(`songs/${folder}`);
      playMusic(songs[0]);
    });
  });
}

// main function
let main = async () => {
  await getSongs("songs/Love_(mood)");
  playMusic(songs[0]);

  displayAlbums();

  play_music.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play_music.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play_music.src = "img/play.svg";
    }
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  prev.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  let vol = document.querySelector(".range").getElementsByTagName("input")[0];

  vol.addEventListener("change", (e) => {
    currentSong.volume = e.target.value / 100;
    if (currentSong.volume > 0) {
      volIcon.src = "img/volume.svg";
    } else {
      volIcon.src = "img/mute.svg";
    }
  });

  let isMuted = false;
  let volIcon = document
    .querySelector(".volume")
    .getElementsByTagName("img")[0];

  volIcon.addEventListener("click", (e) => {
    if (!isMuted) {
      currentSong.volume = 0;
      e.target.src = "img/mute.svg";
      vol.value = 0;
      isMuted = true;
    } else {
      currentSong.volume = 1;
      e.target.src = "img/volume.svg";
      vol.value = 100;
      isMuted = false;
    }
  });

  forward.addEventListener("click", () => {
    if (currentSong.currentTime <= currentSong.duration - 10) {
      currentSong.currentTime = currentSong.currentTime + 10;
    } else {
      currentSong.currentTime = currentSong.duration + 10;
    }
  });
  backward.addEventListener("click", () => {
    if (currentSong.currentTime >= 10) {
      currentSong.currentTime = currentSong.currentTime - 10;
    } else {
      currentSong.currentTime = 0;
    }
  });
};

main();
