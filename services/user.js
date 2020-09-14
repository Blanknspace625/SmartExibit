class User
{
    #UserID;
    #EmailAddress;
    #ProfilePictureRef;
    #Firstname;
    #LastName;

    constructor(EmailAddress, FirstName, LastName, ProfilePictureRef, UserID)
    {
        this.#EmailAddress = EmailAddress;
        this.#Firstname = FirstName;
        this.#LastName = LastName;
        this.#ProfilePictureRef = ProfilePictureRef;

        //UserID can be optinally included if the entry exists in the database
        if(!UserID){ return; }

        this.#UserID = UserID;
    }

    PushToDatabase()
    {
        //TODO Handle creating or updating method calls on database layer
    }


}