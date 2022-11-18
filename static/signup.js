// FILE for signup.html
// user can signup for an account by entering a unique username

// function to sign up
function login() {

    // get username in input
    const username = $("#login-box").val();

    // if the entered name is not empty
    if (username.trim().length > 0) {

        // ajax call to add new user to db
        // @request string username
        // @result dictionary containing user info on successful sign up
        $.ajax({
            type: "POST",
            url: "/signup_post",                
            dataType : "json",
            contentType: "application/json; charset=utf-8",
            data : JSON.stringify(username),
            success: function(result){

                // if username is still empty, something went wrong
                if (result["username"].length == 0) {
                    $('#error-msg').html('Please enter in a valid username.');
                } 
                
                // redirect to user's homepage
                else {
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
        $("#login-box").val("")
        $("#login-box").focus()
    }
}

// when document is ready
$(document).ready(function() {

    // event handler on click
    // login
    $('#login-btn').click(login());

    // event handler on key up enter key
    // login
    $("#login-box").keyup(function(e){   
        if (e.which == 13) {  
            login();
        }
    });
})