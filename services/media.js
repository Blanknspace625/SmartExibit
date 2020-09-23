var Database = require('../DataAccess/database');
var validUrl = require('valid-url');

class Media
{
    #MediaID;
    #MediaLink;

    constructor(MediaLink, MediaID)
    {
        this.#MediaLink = MediaLink;

        //MediaID can be optinally included if the entry exists in the database
        // if(!MediaID){return;}

        this.#MediaID = MediaID;
    }

    linkValid()
    {
        console.log('Checking media link is valid');
        if (validUrl.isUri(this.#MediaLink)){
            return true;
        } else {
            console.log('Not a valid URL');
        }
    }

    PushToDatabase()
    {
        new Database().CreateNewMedia(this);
    }

    GetMediaURL()
    {
        return this.#MediaLink;
    }

    GetMediaID()
    {
        return this.#MediaID;
    }

    SetMediaURL(url)
    {
        this.#MediaLink = url;
    }
}

module.exports = Media;