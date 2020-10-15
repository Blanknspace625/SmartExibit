//Script used to hide unused elements on a users profile
$(document).ready(function () {

    //Email
    if( $.trim($("#emailContent").text()) == ''){
        $(".email").hide();
    }

    //Phone
    if( $.trim($("#phoneNumberContent").text()) == ''){
        $(".phoneNumber").hide();
    }

    //Mobile
    if( $.trim($("#mobileNumberContent").text()) == ''){
        $(".mobileNumber").hide();
    }

    //Address
    if( $.trim($("#addressContent").text()) == ''){
        $(".address").hide();
    }

    //About Me
    if( $.trim($("#aboutMeContent").text()) == ''){
        $("#aboutMe").hide();
    }

    //Work Experience
    if( $.trim($("#workExperienceContent").text()) == ''){
        $("#workExperience").hide();
    }

    //Education
    if( $.trim($("#workExperienceContent").text()) == ''){
        $("#education").hide();
    }

    //Website
    if( $.trim($("#websiteContent").text()) == ''){
        $("#website").hide();
    }

    //Github
    if( $.trim($("#githubContent").text()) == ''){
        $("#github").hide();
    }

    //Twitter
    if( $.trim($("#twitterContent").text()) == ''){
        $("#twitter").hide();
    }

    //Instagram
    if( $.trim($("#instagramContent").text()) == ''){
        $("#instagram").hide();
    }

    //Facebook
    if( $.trim($("#facebookContent").text()) == ''){
        $("#facebook").hide();
    }

    //Showcase1

    //Showcase2

    //Showcase3

    //Showcase4

    //Showcase5

    //User Skills
    //Disabled for now will implement if there is time
    $(".userSkills").hide();
});