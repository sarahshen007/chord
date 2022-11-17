import {getRandomColor} from "./layout.js"
import {createMusicListCard} from "./layout.js"
import {goToPage} from "./layout.js"

function populateSongsContainer() {
    for (let i = 0; i < playlist.Songs.length; i++) {
        const song = playlist.Songs[i]
        console.log('song in album: ', song)

        createMusicListCard($("#songs-container"), [song[0], song[2]], song[1], 'song')
    }
}

$(document).ready(function() {
    $('#album-pic').css('background-color', getRandomColor())
})

$(document).ready(function() {
    populateSongsContainer();

    $(".clickable").on('click', function() {
        goToPage(this)
    });
})