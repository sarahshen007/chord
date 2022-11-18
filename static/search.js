// FILE FOR search.html
// allows a user to search the db

// imports
import {createMusicListCard} from "./layout.js"
import {goToPage} from "./layout.js"

// array to store search results
let search_results = []

// search for all items that partially match the query string and populate the results container with the search results
// @param query - a string
function getSearchResults(query) {

    // only search if the length of the query is greater than 2
    if (query.length >= 2) {

        // ajax call to search query in Songs
        // @data query 
        // @result dictionary containing array of items representing search results
        // each item in the array is formatted as such:
        //      [item_name, item_id, ...]
        $.ajax({
            type: "POST",
            url: "/search",                
            dataType : "json",
            cache: true,
            contentType: "application/json",
            data : JSON.stringify(query),
            success: function(result){
                search_results = result;

                // populate search results container
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

// populate results container
// @param results - dictionary containing multiple arrays of items representing search results, one array for each category ('Songs', 'Artists', 'Podcasts', etc)
// each item in the array is formatted as such:
//      [item_name, item_id, ...]
function populateResults(results) {

    // empty search results container
    $("#search-results").empty();

    // set index = 0
    let i = 0

    // for each type in results
    for (var key in results){

        // check if the length of the search results array for that type is greater than 0
        if (results[key].length > 0) {

            // create new id using index
            const id = "result-" + i

            // create wrapper for search results
            let wrapper = $('<div class="section-card"></div>')

            // create button to toggle type list collapse
            let button = $('<button class="search-results-btn btn btn-toggle collapsed nav-btn" data-bs-toggle="collapse" data-bs-target="#' + id + '" aria-expanded="false"></button>')

            // create title to lable type
            let title = $('<h3>' + key + '</h3>')

            // append title to button
            button.append(title)

            // create collapsible div of search results
            let results_div = $('<div id="' + id + '" class="collapse results-div"></div>')

            // append button to wrapper
            wrapper.append(button)

            // append results div to wrapper
            wrapper.append(results_div)

            // for result in array of results for given type
            for (var result in results[key]) {

                // format type string
                const type = key.substring(0, key.length - 1).toLowerCase();

                // create music list card using data from result and formatted type string
                createMusicListCard(results_div, [results[key][result][0], results[key][result[2]]], results[key][result][1], type)
            }

            // append wrapper to search results container
            $("#search-results").append(wrapper)

            // add to index
            i++
        }
    }
      
}

// when the document is ready
$(document).ready(function (){

    // event handler on input
    // when search bar gets input
    $("#search-bar").on('input' ,function() {
        // get search results using the value in the search bar as the query
        getSearchResults($('#search-bar').val())
    });

    // making sure all the clickable buttons that go to info pages go to that page
    $(".clickable").on('click', function() {
        goToPage(this)
    });
});