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

            console.log(results[key])

            for (var result in results[key]) {
                let result_div = $('<div>'+results[key][result][0]+'</div>')
                results_div.append(result_div)
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