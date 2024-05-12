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

#### Email Setup
- I will use ethereal to simulate the email thing, but could be done with any other
plataform.
- [] ethereal credentials (create account/login)
- [] install nodemailer
- [] create (nodemailerConfig, sendEmail,
  sendResetPasswordEmail, sendVerficationEmail) files in utils

### sendVerificationEmail
- Ok, so, the first to functions (nodemailerConfig, sendEmail) were only auxiliary functions
to use here (and then in password). in the sendVerificationEmail, we received some
basic stuff that will be used in sendEmail, such as email. However, we want to send
to the user an email for the verification. On that email, when the <a> is clicked,
it will be redirected to some page on the frontend. This page (already established on front)
is expecting to receive on the url the token and the email. Then, in the frontend,
the verify-email controller in the backend will be consumed (and the verificationToken and
the email will be passed through req.body).
Please note that when the email is sent, from teh backend, we send a link to a frontend
page. Thats why verifyEmailURL in sendVerificationEmail is like that (that origin represents the domain from the front - in our case localhost://3000 but could be the production url).

### Some side notes - check controller auth register
  // when we dont really know the url from front, or several urls
  // where the server is located and from where comes de request (in headres)
  // if we look for req.get(origin), it gives us the server location (bcs of the proxy I set up on the frontend)
  // const protocol = req.protocol
  //  const host = req.get('host');
  // const forwardedHost = req.get('x-forwarded-host');
  // const forwardedProtocol = req.get('x-forwarded-proto');

#### Token - Idea

- Till now, we have setup the token within our cookies. When there is a login, token is generated, with
a certain lifetime (cookie) (stateless);
 However, in the real production
product, it makes sense to have an accessToken (with a small lifetime) and a refreshToken
(with more lifeTime). If we only have the accessTOken, lets suppose with 5 minutes
duration, after that the cookie will be erased and then automatically the user
will be logged out. What is going to happen is that we will search not only for
the accessTOken, but also for the refresh one. If the refresh is still valid but the 
other one has expired, when updated the page, a the access token will be updated
(=== refreshToken).
- For that, we will do a token model, and perform with that later.

#### Token Model

- [] create Token.js in models
- [] refreshToken,ip,userAgent - all String and required
- [] isValid - Boolean, default:true
- [] ref user
- [] timestamps true

#### Refactor Auth Middleware - AccessToken
- I forgot to write, but I've done a series of changes in which basically it is
created two cookies, the access and the refresh, and also a little refactoring
of the login controller to generate thi new two cookies. the access one, is equal
to the previous one, where the cookie is generated based on the same user info, I
just changed the time to check if it's working. On the other hand, the refresh token
have a plus info, which is the refreshToken generated on login controller (this token is
only generated once, after that, is stored in the database and when generating the cookies
this value is the same). This is basically what was done till now.
- Now I changed the authentication middleware to give the same result as before.
If I run the app as before, it will work exactly the same, bcs the refreshToken
is not being used anywhere.