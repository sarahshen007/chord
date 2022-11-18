// FILE FOR my_songs.html
// show a user's liked songs

// imports
import {goToPage} from "./layout.js"
import {populateListCardContainer} from "./layout.js"

// when document is ready
$(document).ready(function() {
    populateListCardContainer($("#liked-songs-container"), songs, 'song') //populate liked-songs container with cards of songs liked by user
})

$(document).ready(function() {

    // making sure all the clickable buttons that go to info pages go to that page
    $(".clickable").on('click', function() {
        goToPage(this)
    });
})