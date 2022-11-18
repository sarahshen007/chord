// FILE FOR login.html
// Getting username input and logging in on event keypress enter key or click on login button

// login
function login() {

    // get username from input text
    const username = $("#login-box").val();

    // if the username entered's length is greater than 0 without whitespace
    if (username.trim().length > 0) {

        // ajax call to login
        // @request string username entered by user
        // @result dictionary containing username, user_id of successful login
        $.ajax({
            type: "POST",
            url: "/login",                
            dataType : "json",
            contentType: "application/json; charset=utf-8",
            data : JSON.stringify(username),
            success: function(result){

                // if the resulting username's length is 0, 
                // no valid user was found with the entered username
                if (result["username"].length == 0) {
                    $('#error-msg').html('Please enter in a valid username.'); // display error msg
                } 
                
                // else the user was found
                else {
                    window.location.href = "/"; // redirect to user's homepage
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
        $("#login-box").val("") // reset login box val to empty
        $("#login-box").focus() // re focus on box 
    }
}

// when document is ready
$(document).ready(function() {

    // event handler on click login button
    // login
    $('#login-btn').click(login());

    // event handler on key up of enter key
    // login
    $("#login-box").keyup(function(e){   
        if (e.which == 13) {  
            login();
        }
    });

    
})