var Database = require('../DataAccess/database')

class User
{
    #UserID;
    #EmailAddress;
    #ProfilePictureRef;
    #Firstname;
    #LastName;
    #Password;

    constructor(EmailAddress, FirstName, LastName, ProfilePictureRef, Password)
    {
        this.#EmailAddress = EmailAddress;
        this.#Firstname = FirstName;
        this.#LastName = LastName;
        this.#ProfilePictureRef = ProfilePictureRef;
        this.#Password = Password;

        //UserID can be optinally included if the entry exists in the database
        //if(!UserID){ return; }

        //this.#UserID = UserID;
    }

    PushToDatabase()
    {
        new Database().CreateNewUser(this);
    }

    IsValid()
    {
        console.log('Checking User is valid');

        console.log(this.#Firstname);
        if(this.#Firstname == ''){return "Must Include First Name!"}

        console.log(this.#LastName);
        if(this.#LastName == ''){return "Must Include Last Name!"}

        console.log(this.#EmailAddress);
        if(this.#EmailAddress == ''){return "Must Include Email Address!"}

        console.log(this.#ProfilePictureRef);
        console.log(this.#Password);
        if(this.#Password == ''){return "Must Include Password!"}

        return "OK";
    }

    GetUserEmail(){
        return this.#EmailAddress;
    }

    GetUserFirstName(){
        return this.#Firstname;
    }

    GetUserLastName(){
        return this.#LastName;
    }

    GetUserProfilePic(){
        return this.#ProfilePictureRef;
    }

    GetUserPassword(){
        return this.#Password;
    }
}

module.exports = User;