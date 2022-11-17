import {getRandomColor} from "./layout.js"
import {createMusicCard} from "./layout.js"
import {goToPage} from "./layout.js"

function populateForYou() {
    $.ajax({
        type: "POST",
        url: "/song_recommendations",                
        dataType : "json",
        cache: true,
        contentType: "application/json",
        data : JSON.stringify(user),
        success: function(result){
            for (let i = 0; i < result['Recommendations'].length; i++) {
                const recs = result['Recommendations']
                createMusicCard($('#recommendations'), [recs[i][0], recs[i][2]], recs[i][1], 'song')
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

$(document).ready(function (){    
    populateForYou();
});

$(document).ready(function() {
    $(".clickable").on('click', function() {
        goToPage(this)
    });
})
