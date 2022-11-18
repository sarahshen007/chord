// FILE FOR my_podcasts.html
// show a user's followed podcasts

// imports
import {populateCardContainer} from "./layout.js"
import {goToPage} from "./layout.js"

// when the document is ready
$(document).ready(function() {
    populateCardContainer($("#liked-podcasts-container"), podcasts, 'podcast')      // populate liked-podcasts container with all podcasts liked by user

    // making sure all the clickable buttons that go to info pages go to that page
    $(".clickable").on('click', function() {
        goToPage(this)
    });
})