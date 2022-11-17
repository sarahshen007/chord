import {createMusicListCard} from "./layout.js"
import {goToPage} from "./layout.js"

let search_results = []

function getSearchResults(query) {
    if (query.length >= 2) {
        $.ajax({
            type: "POST",
            url: "/search",                
            dataType : "json",
            cache: true,
            contentType: "application/json",
            data : JSON.stringify(query),
            success: function(result){
                search_results = result;
                populateResults(result);
            },
            error: function(request, status, error){
                console.log("Error");
                console.log(request);
                console.log(status);
                console.log(error);
            }
        });
    }
}

function populateResults(results) {
    $("#search-results").empty();

    let i = 0
    for (var key in results){

        if (results[key].length > 0) {
            const id = "result-" + i
            let wrapper = $('<div class="section-card"></div>')
            let button = $('<button class="search-results-btn btn btn-toggle collapsed nav-btn" data-bs-toggle="collapse" data-bs-target="#' + id + '" aria-expanded="false"></button>')
            let title = $('<h3>' + key + '</h3>')
            button.append(title)

            let results_div = $('<div id="' + id + '" class="collapse results-div"></div>')

            wrapper.append(button)
            wrapper.append(results_div)

            for (var result in results[key]) {
                const type = key.substring(0, key.length - 1).toLowerCase();
                console.log('type: ', type)

                createMusicListCard(results_div, [results[key][result][0], results[key][result[2]]], results[key][result][1], type)
            }

            $("#search-results").append(wrapper)
            i++
        }
    }
      
}

$(document).ready(function (){
    $("#search-bar").on('input' ,function() {
        getSearchResults($('#search-bar').val())
    });
});

$(document).ready(function() {
    $(".clickable").on('click', function() {
        goToPage(this)
    });
})