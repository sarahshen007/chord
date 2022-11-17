import {populateCardContainer} from "./layout.js"
import {goToPage} from "./layout.js"

$(document).ready(function() {
    populateCardContainer($("#liked-podcasts-container"), podcasts, 'podcast')

    $(".clickable").on('click', function() {
        goToPage(this)
    });
})