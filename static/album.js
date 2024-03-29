// FILE FOR album.html INTERACTIONS
// to display album name, artist, and songs in the album

// imports
import {getRandomColor} from "./layout.js"
import {populateListCardContainer} from "./layout.js"
import {goToPage} from "./layout.js"


// when document is ready
$(document).ready(function() {
     // adding random color to album picture
    $('#album-pic').css('background-color', getRandomColor())

    // populating the container of songs in the album with data
    populateListCardContainer($("#songs-container"), album.Songs, 'song')

    // making sure all the clickable buttons that go to info pages go to that page
    $(".clickable").on('click', function() {
        goToPage(this)
    });
})