import {getRandomColor} from "./layout.js"
import {createMusicCard} from "./layout.js"
import {goToPage} from "./layout.js"

function populateLikedSongs() {
    for (let i = 0; i < songs.length; i++) {
        const song = songs[i]


    }
}

$(document).ready(function() {

})

$(document).ready(function() {
    $(".clickable").on('click', function() {
        goToPage(this)
    });
})