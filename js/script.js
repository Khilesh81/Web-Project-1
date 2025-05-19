console.log("Let's write some JavaScript code!");
let currentsong = new Audio();
let songs;
let currfolder;

function convertSecondsToMinutes(seconds) {
    // if ( isNaN(seconds) || seconds < 0){
    //     return "Invalid Input";
    // }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    // Pad with leading zeros to ensure 2-digit format
    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');

    return `${formattedMins}:${formattedSecs}`;
}


async function getSongs(folder) {
    currfolder = folder;
    // Your external browser url in this fetch to get folder of songs
    let a = await fetch(`/${folder}/`);
    console.log(a)
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    // console.log(as);
    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }


    // show all the songs in the playlist
    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUl.innerHTML = ""
    for (const song of songs) {
        // Extract artist name from the song file name (assuming the format "Artist - Song Title.mp3")
        const [title, artist] = song.replaceAll("%20", " ").replace(".mp3", "").split(" - ");
        songUl.innerHTML = songUl.innerHTML + `<li>
        <img class="invert" src="svg/music.svg" alt="">
            <div class="songinfo">
            <div class="songname">${(title || song.replaceAll("%20", " ").replace(".mp3", ""))}</div>
            <div class="artistname">${artist || "Unknown Artist"}</div>
            </div>
            <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="svg/play.svg" alt="">
            </div>
        </li>`;
    }

    // Add an event listener to each song

    Array.from(songUl.children).forEach((e, i) => {
        e.addEventListener("click", () => {
            const songFileName = songs[i];
            console.log(`Playing: ${songFileName.replaceAll("%20", " ")}`);
            playMusic(songFileName);
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track);
    currentsong.src = `/${currfolder}/` + track;

    if (!pause) {
        currentsong.play();
        play.src = "svg/pause.svg"
    }

    document.querySelector(".songbar").innerHTML = decodeURI(track)
    document.querySelector(".starttime").innerHTML = ""
    document.querySelector(".endtime").innerHTML = ""
}

async function displayalbums() {
    // your brwoser url to fetch song from folder
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardcontainer = document.querySelector(".cardcontainer")

    let array = Array.from(anchors)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);

            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card rounded">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" width="51" height="44" viewBox="0 0 512 512">
                                <!-- Green circular background -->
                                <circle cx="229" cy="258" r="256" fill="#1fdf64" />
                                <!-- Large black triangular play icon -->
                                <path d="M360 256L160 120v272z" fill="black" />
                            </svg>

                        </div>
                       
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h3>${response.title}</h3>
                        <div>${response.Description}</div>
                    </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        // console.log(e)
        e.addEventListener("click", async item => {
            console.log(item, item.currentTarget.dataset)
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}

async function main() {
    // Get the list of all the songs
    await getSongs("songs/F1");
    playMusic(songs[0], true);

    // Display all the album on the page
    displayalbums();

    // add an event listener to previous , play and next a song
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "svg/pause.svg"
            currentsong.volume = 1; // Set volume to full when the song starts
        }
        else {
            currentsong.pause()
            play.src = "svg/play.svg"
        }
    })

    // listen for time update event
    currentsong.addEventListener("timeupdate", () => {
        // console.log(currentsong.currentTime, currentsong.duration)
        document.querySelector(".starttime").innerHTML = `${convertSecondsToMinutes(currentsong.currentTime)}`
        document.querySelector(".endtime").innerHTML = `${isNaN(currentsong.duration) ? "" : convertSecondsToMinutes(currentsong.duration)}`
        if (!isNaN(currentsong.duration) && currentsong.duration > 0) {
            document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
        }
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;
    })

    // Add an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    // Add an event listener to cancel button
    document.querySelector(".cancel").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    // Add an event listener to previous button
    previous.addEventListener("click", () => {
        console.log("Previous clicked")
        currentsong.pause()

        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        // console.log(index)
        if ((index - 1) >= 0) {
            console.log(index, songs.length)
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next buttton
    next.addEventListener("click", () => {
        console.log("Next clicked")
        currentsong.pause()

        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index) < (songs.length - 1)) {
            console.log(index, songs.length)
            playMusic(songs[index + 1])
        }

    })

    // Add an event listener to volume buttton
    document.querySelector(".volumebar").addEventListener("click", (e) => {
        let percent2 = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".volcircle").style.left = percent2 + "%";

    })

    // Apply display on volume icons
    document.querySelector(".volume").addEventListener("click", () => {
        let volumebtn = parseFloat(document.querySelector(".volcircle").style.left);
        document.querySelector(".volumehigh").style.display = "none";
        document.querySelector(".volumemute").style.display = "none";
        document.querySelector(".volumelow").style.display = "none";
        document.querySelector(".volumemed").style.display = "none";

        if (volumebtn === 0) {
            document.querySelector(".volumemute").style.display = "block";
        } else if (volumebtn > 0 && volumebtn <= 33) {
            document.querySelector(".volumelow").style.display = "block";
        } else if (volumebtn > 33 && volumebtn <= 66) {
            document.querySelector(".volumemed").style.display = "block";
        } else {
            document.querySelector(".volumehigh").style.display = "block";
        }


    });

    document.querySelector(".volumeimage").addEventListener("click", () => {
        if (currentsong.muted) {
            currentsong.muted = false;
            document.querySelector(".volumemute").style.display = "none";
            document.querySelector(".volumehigh").style.display = "block";
            document.querySelector(".volcircle").style.left = "100%"; // Set volume bar to full
        } else {
            currentsong.muted = true;
            document.querySelector(".volumemute").style.display = "block";
            document.querySelector(".volumehigh").style.display = "none";
            document.querySelector(".volcircle").style.left = "0%"; // Set volume bar to zero
        }
    });

    // Set the volume of the current song
    document.querySelector(".volumebar").addEventListener("click", (e) => {
        let percent3 = (e.offsetX / e.target.getBoundingClientRect().width);
        document.querySelector(".volcircle").style.left = (percent3 * 100) + "%";
        currentsong.volume = percent3;
    });

    // Play the next song in order after the current one ends
    currentsong.addEventListener("ended", () => {
        if (songs && songs.length > 0) {
            let currentIndex = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
            let nextIndex = currentIndex + 1;
            if (nextIndex < songs.length) {
                playMusic(songs[nextIndex]);
            }
        }
    });


}


main();
