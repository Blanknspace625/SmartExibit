var Database = require('../DataAccess/Database')

class User
{
    #UserID;
    #EmailAddress;
    #ProfilePictureRef;
    #Firstname;
    #LastName;

    constructor(EmailAddress, FirstName, LastName, ProfilePictureRef)
    {
        this.#EmailAddress = EmailAddress;
        this.#Firstname = FirstName;
        this.#LastName = LastName;
        this.#ProfilePictureRef = ProfilePictureRef;

        //UserID can be optinally included if the entry exists in the database
        //if(!UserID){ return; }

        //this.#UserID = UserID;
    }

    PushToDatabase()
    {
        Database.CreateNewUser();
    }

    IsValid()
    {
        console.log('Checking User is valid');
        console.log(this.#Firstname);
        console.log(this.#LastName);
        console.log(this.#EmailAddress);
        console.log(this.#ProfilePictureRef);
    }

}

module.exports = User;