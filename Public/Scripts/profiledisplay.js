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

    //Check all showcases
    var showcase1 = true;
    var showcase2 = true;
    var showcase3 = true;
    var showcase4 = true;
    var showcase5 = true;

    //Showcase1
    if( $.trim($("#showcase1Content").text()) == ''){
        $("#showcase1").hide();
        showcase1 = false;
    }

    //Showcase2
    if( $.trim($("#showcase2Content").text()) == ''){
        $("#showcase2").hide();
        showcase2 = false;
    }

    //Showcase3
    if( $.trim($("#showcase3Content").text()) == ''){
        $("#showcase3").hide();
        showcase3 = false;
    }

    //Showcase4
    if( $.trim($("#showcase4Content").text()) == ''){
        $("#showcase4").hide();
        showcase4 = false;
    }

    //Showcase5
    if( $.trim($("#showcase5Content").text()) == ''){
        $("#showcase5").hide();
        showcase5 = false;
    }

    //Showcase Pannels
    if(!(showcase1 || showcase2 || showcase3 || showcase4 || showcase5)){
        $(".showcases").hide();
    }
    
    //User Skills
    //Disabled for now will implement if there is time
    $(".userSkills").hide();
});