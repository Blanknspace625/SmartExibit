class Showcase
{
    #ShowcaseID;
    #OwningUser;
    #ShowcaseName;
    #ShowcaseVisibility;
    #DateLastModified;
    
    #AttatchedMedia
    
    constructor(OwningUser, ShowcaseName, ShowcaseVisibility, DateLastModified, ShowcaseID)
    {
        this.#OwningUser = OwningUser;
        this.#ShowcaseName = ShowcaseName;
        this.#ShowcaseVisibility = ShowcaseVisibility;
        this.#DateLastModified = DateLastModified;
        
        //ShowcaseID can be optinally included if the entry exists in the database
        if(!ShowcaseID){ return; }
        
        this.#ShowcaseID = ShowcaseID
    }

    AttatchMedia(Media)
    {
        this.#AttatchedMedia.push(Media);
    }

    SaveChanges()
    {
        //TODO Push object to database
    }
}