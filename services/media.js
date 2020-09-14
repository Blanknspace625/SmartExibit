class Media
{
    #MediaID;
    #MediaLink;

    constructor(MediaLink, MediaID)
    {
        this.#MediaLink = MediaLink;

        //MediaID can be optinally included if the entry exists in the database
        if(!MediaID){return;}

        this.#MediaID = MediaID;
    }
}