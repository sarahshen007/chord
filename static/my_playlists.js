import {getRandomColor} from "./layout.js"
import {createMusicCard} from "./layout.js"
import {goToPage} from "./layout.js"

$(document).ready(function() {
    $(".clickable").on('click', function() {
        goToPage(this)
    });
})