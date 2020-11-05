<span style="color: green">`GET`</span> **'/'** <br />

This method redirects to the dashboard if the user is logged in or the homepage if not <br />

<span style="color: green"> `GET` </span> **'/index'** <br />

Returns website homepage <br />

<span style="color: green">`GET`</span> **'/contact'**

Returns contact us page <br />

<span style="color: green">`GET`</span> **'/about'**

Returns about us page <br />

<span style="color: green">`GET`</span> **'/signup'**

Returns signup Page <br />

<span style="color: orange"> `POST` </span> **'/signup'** <br />

Request to sign up a new user<br />

Parameters | Type | Description
--- | --- | ---
email | String | the users email they are using to sign up
firstName | String | The new user's first name provided
lastName | String | The user's last name provided 
password | String | the user's provided password
confirmPassword | String | the same password again from a different input to confirm correctness

The data above must be provided in the body of the post request as json or form data. <br />

<span style="color: green">`GET`</span> **'/dashboard'**

Returns the dasboard for the user that is logged in or redirects to the sign in page <br />

<span style="color: green">`GET`</span> **'/ext-profile'** <br />

Used to access profiles with no need to log in. <br />

Parameters | Type | Description
--- | --- | ---
profileID | Int | The unique id for a given user

<span style="color: green">`GET`</span> **'/ext-private'** <br />

Used when a profile is marked as private as a redirect.

<span style="color: green">`GET`</span> **'/profile'** <br />

Returns the profile of the logged in user or redirects to the login page.

<span style="color: orange"> `POST` </span> **'/profile'** <br />

Used to edit data on the logged in user's profile. <br />

Parameters | Type | Description
--- | --- | ---
phoneNumber | Int | User's phone number
address | String | User's address
aboutMe | String | An about me section for the users to explain about themselves
workExperience | String | A section to outline a user's work experience
education  | String | A section to outline a user's education
occupation | String | The user's current occupation

The Data must be provided in the body of the post request as json or form data

<span style="color: green">`GET`</span> **'/settings'** <br />

Returns the settings page for the user.

<span style="color: orange"> `POST` </span> **'/changedetail'** <br />

Used to update the users account information. <br />

Parameters | Type | Description
--- | --- | ---
email | String | User's Email Address
firstName | String | User's first name
lastName | String | User's last name

The Data must be provided in the body of the post request as json or form data

<span style="color: orange"> `POST` </span> **'/changeavatar'** <br />

Used to update a user's avatar as a file upload.

<span style="color: orange"> `POST` </span> **'/changepassword'** <br />

Used to allow a logged in user to update their password.

Parameters | Type | Description
--- | --- | ---
oldPassword | String | The user's old password for verification.
newPassword | String | The user's new password.
newPassword | String | The user's new password again to confirm.

The Data must be provided in the body of the post request as json or form data

<span style="color: orange"> `POST` </span> **'/changeprivacy'** <br />

Used to let a user update privacy settings on their profile.

Parameters | Type | Description
--- | --- | ---
privatePortfolio | Enum("checked", "") | Checked if the user does not wish for their profile to be public.
showEmail | Enum("checked", "") | Checked if the user wants to display their email on their profile.
showPhone | Enum("checked", "") | Checked if the user wants to display their phone number on their profile.
showAddress | Enum("checked", "") | Checked if the user wants to display their address on their profile.

The Data must be provided in the body of the post request as json or form data

<span style="color: orange"> `POST` </span> **'/linkaccounts'**

Used to let a user link their social media accounts to their profile.

Parameters | Type | Description
--- | --- | ---
website | String | A link to the user's specified website
facebook | String | A link to the user's specified facebook
linkedin | String | A link to the user's specified linkedin
twitter | String | A link to the user's specified twitter
instagram | String | A link to the user's specified instagram
github | String | A link to the user's specified github

The Data must be provided in the body of the post request as json or form data

<span style="color: green">`GET`</span> **'/signin'** <br />

Returns the sign in page.

<span style="color: orange"> `POST` </span> **'/signin'** <br />

Used to handle a sign in 

Parameters | Type | Description
--- | --- | ---
email | String | The account email for login attempt
password | String | The account password for login attempt

The Data must be provided in the body of the post request as json or form data

<span style="color: green">`GET`</span> **'/signout'**

Signs out the user that is currently logged in.

<span style="color: green">`GET`</span> **'/iforgot'**

Returns the forgot password page.

<span style="color: orange"> `POST` </span> **'/iforgot'**

Used to send a request to reset a forgotten password.

Parameters | Type | Description
--- | --- | ---
email | String | The account email for the forgoten password.

The Data must be provided in the body of the post request as json or form data

<span style="color: green">`GET`</span> **'/resetpassword'** <br />

returns the reset password page.

<span style="color: orange"> `POST` </span> **'/resetpassword'**

Submits a password reset request

Parameters | Type | Description
--- | --- | ---
id | Int | The account id for the reset attempt.
code | String | The one time code for password reset.
newPassword | String | The new password.
newPasswordAgain | String | The new password again to verify it.

The Data must be provided in the body of the post request as json or form data

<span style="color: green">`GET`</span> **'/proceed-register'**

Loads a page to prompt the user to check their email to verify their account.

<span style="color: green">`GET`</span> **'/proceed-reset'**

Loads a page prompting a user to check their email for the code to reset their password

<span style="color: green">`GET`</span> **'/verifyemail'**

Returns the verify email address page to activate an account

<span style="color: green">`GET`</span> <span style="color: red">**'/showcasedata'** Depreciated</span>

Used to retrieve a showcase

<span style="color: orange"> `POST` </span> <span style="color: red">**'/updateshowcase'** Depreciated</span>

Used to update a Showcase

<span style="color: green">`GET`</span> **'/media'**

<span style="color: green">`GET`</span> **'/documents'**

Returns documents for specified user.

<span style="color: green">`GET`</span> **'/retrive'**

Returns a specific file requested.

<span style="color: green">`GET`</span> **'/upload'**

<span style="color: orange"> `POST` </span> **'/upload'**

<span style="color: orange"> `POST` </span> **'/message'**

Used to Send a user a message.

Parameters | Type | Description
--- | --- | ---
id | Int | The id of the user to message
senderName | String | The name of the person sending the message to identify them.
senderEmail | String | The email which the recipiant can respond to.
message | String | The body of the message to send to the User.

The Data must be provided in the body of the post request as json or form data

<span style="color: green">`GET`</span> **'/proceed-message'**

Returns page notifying sender of message that their message has been sent.

<span style="color: green">`GET`</span> **'/getmedia'**

<span style="color: green">`GET`</span> **'/stats'**

Returns the stats page for a user to see how many views they are getting.

<span style="color: green">`GET`</span> **'*'**

Error page for 404 error