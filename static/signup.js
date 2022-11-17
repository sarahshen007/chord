function login() {
    const username = $("#login-box").val();
    if (username.trim().length > 0) {
        $.ajax({
            type: "POST",
            url: "/signup_post",                
            dataType : "json",
            contentType: "application/json; charset=utf-8",
            data : JSON.stringify(username),
            success: function(result){
                if (result["username"].length == 0) {
                    $('#error-msg').html('Please enter in a valid username.');
                } else {
                    window.location.href = "/";
                }
            },
            error: function(request, status, error){
                console.log("Error");
                console.log(request)
                console.log(status)
                console.log(error)
            }
        });
    } else {
        $("#search-box").val("")
        $("#search-box").focus()
    }
}

// event handlers
$(document).ready(function() {
    $('#login-btn').click(login());

    $("#login-box").keyup(function(e){   
        if (e.which == 13) {  
            login();
        }
    });
})