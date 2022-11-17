import {goToPage} from "./layout.js"
import {populateCardContainer} from "./layout.js"

$(document).ready(function() {
    populateCardContainer($("#liked-artists-container"), artists, 'artist')
})

$(document).ready(function() {
    $(".clickable").on('click', function() {
        goToPage(this)
    });
})