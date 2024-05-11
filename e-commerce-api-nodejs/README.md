#### Update User Model

- [] add following three properties
- [] verificationToken - String
- [] isVerified - {type:Boolean, default:false}
- [] verified - Date

#### Update Register Controller

- [] setup fake verificationToken - 'fake token'
- [] remove everything after User.create()
- [] send back success message and token

#### Update Login Controller

- [] right after isPasswordCorrect
- [] check if user.isVerified, if not 401


#### Email Controller setup

- Explanation: Basically, when a user does the register, we wanna send him a verification
email account. Thats why I setup in the user model the isVerified. I also
generate a token (verificationToken) that is sent to the frontend where this token
is re-sent to the backend if the user clicks in the url or something like that 
sent to the email. If he does it, the backend receives the token, checks if is 
similar to the stored one. If it is, then, we update the isVerified property of
user and he is able to login and do all the other stuff. The token is sent as a 
url param query from the forntend probably not yet decided.
So I'll configure a controller to verify email where we will do this

#### Verify Email Controller

- [] create verifyEmail in authController
- [] get verificationToken and email from req.body
- [] setup a '/verify-email' route in authRoutes
- [] test in a Postman
- [] check for user using email
- [] if no user 401
- [] if token does not match user token 401
- [] if correct set
- [] user.isVerified = true
- [] user.verified = Date.now()
- [] user.verificationToken = ''
- [] save use with instance method
- [] return msg:'email verified'