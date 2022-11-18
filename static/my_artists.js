// FILE FOR my_artists.html
// show a user's liked artists

// imports
import {goToPage} from "./layout.js"
import {populateCardContainer} from "./layout.js"

// when the document is ready
$(document).ready(function() {

    // populate liked artists container with music cards of all user's liked artists
    populateCardContainer($("#liked-artists-container"), artists, 'artist')
})

$(document).ready(function() {

    // making sure all the clickable buttons that go to info pages go to that page
    $(".clickable").on('click', function() {
        goToPage(this)
    });

})