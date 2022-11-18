import {getRandomColor} from "./layout.js"
import {createMusicCard} from "./layout.js"
import {goToPage} from "./layout.js"

// FILE FOR home.html
// welcome the user to their home section, give them recommended songs

// populate 'For you' section on home page
function populateForYou() {

    // ajax call to retrieve song recommendations
    // @data user dictionary containing user_id and username 
    // @result dictionary of 'recommendations' containing array of tuples representing recommendation results
    // each tuple in the array is formatted as such:
    //      tuple[0] is the name of the song
    //      tuple[1] is the song id
    //      tuple[2] is the song's artist's name
    $.ajax({
        type: "POST",
        url: "/song_recommendations",                
        dataType : "json",
        cache: true,
        contentType: "application/json",
        data : JSON.stringify(user),
        success: function(result){

            // extract list of recommendations from result dictionary
            let recommendationsList = result['Recommendations']

            // loop through recommendations
            for (let i = 0; i < result['Recommendations'].length; i++) {

                // for each recommended song
                const recs = recommendationsList[i]

                // create a music card for that song and append it to #recommendations
                // #recommendations - the container of recommendations on the homepage
                createMusicCard($('#recommendations'), [recs[0], recs[2]], recs[1], 'song')
            }
        },
        error: function(request, status, error){
            console.log("Error");
            console.log(request)
            console.log(status)
            console.log(error)
        }
    });
}

// when the document loads
$(document).ready(function (){    

    // populate the 'For you' section
    populateForYou();
});


// when the document loads pt 2
$(document).ready(function() {

    // making sure all the clickable buttons that go to info pages go to that page
    $(".clickable").on('click', function() {
        goToPage(this)
    });
})
