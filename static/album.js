import {getRandomColor} from "./layout.js"
import {populateListCardContainer} from "./layout.js"
import {goToPage} from "./layout.js"

$(document).ready(function() {
    $('#album-pic').css('background-color', getRandomColor())
})

$(document).ready(function() {
    populateListCardContainer($("#songs-container"), album.Songs, 'song')

    $(".clickable").on('click', function() {
        goToPage(this)
    });
})