import {goToPage} from "./layout.js"
import {populateListCardContainer} from "./layout.js"


$(document).ready(function() {
    populateListCardContainer($("#liked-songs-container"), songs, 'song')
})

$(document).ready(function() {
    $(".clickable").on('click', function() {
        goToPage(this)
    });
})