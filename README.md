```
npm run start
```

1)- check authentication state in store
2)- if not logged in do nothing if logged in do nothing if logging in then continue process wherever left
3)- ui will up and ask for authentication state 
4)- user logged --> token --> validateToken --> if valid then enter entry as logging in 
5)- Get data from server about the font names and add their state as installing 
6)- Download the zipped fonts file in any folder 
7)- Install them using fontIO 
8)- Save assets status in file 
9)- UI will ask or inform 

Token --> Login, token --> UI (logging in) --> Login_response (
    state: Logged In,
    data: {
        assets,
        user,
    }
)

Screens --> 
Logging In ,(Loader icon with message)
Logging Out,  (Loader icon with message)
Logged In, (User Details, Assets [
     FontMd5: md5,
     FontName: fullName,
     FontId: md5,
     FontPsName: psName,
     FontFamilyName: family,
     State: Activated/Failed
]
FontName, 
Rendering (Preview ) [Render-By-Style],
Actual State (Activated, Fao;ed)
)
Logged Out, (Input Box for token with submit button)

Response --> 
Request LoginStatus, Login, Logout 
Login_Response {
    State: LoggingIn/LoggingOut/LoggedIn/LoggedOut
    Data: {
        User,
        Assets,
    }
}

Flow --> 
LoginStatus --> Ask --> (checking user session [1sec]) --> Response 
Login --> Ask --> (self consider logging in)
Logout --> Ask --> (self condier loggig out) 




FOntIO send data back to hls grpc server 
So this needs to be started on same port as hls 

