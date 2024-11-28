# Team 3 | Mobile Matching App

A matching app designed to work on IOS and Android
It is meant to be used for property owners, tenants and case handlers to ensure easier matches between possible tenants and housing for Section 8 housing vouchers

## Authors
- [@Jared](https://github.com/Cold-Change)
- [@Jeffrey](https://github.com/WillNav22)
- [@Kaan](https://github.com/TheKaanK)
- [@Matthew](https://github.com/mcolucci40)
- [@Phil](https://github.com/PhilPingPNG)

# Backend Testing w/ Postman:

- In terminal, change dir to backend: cd backend
- Create virtual environment: python -m venv venv
- Activate virtual environment
- Install libraries: pip install -r requirements.txt
- Start backend with 'flask run'

## POST ../register Testing
- Description: Registers a new user.


- Click add request on Postman
- Select POST option, and paste http://127.0.0.1:5000/register in URL Box
- Select Body select  RAW:
- Paste the following:
```
{
  "username": "EnterANewUsername",
  "password": "testpassword",
  "firstName": "FirstName",
  "lastName": "LastName",
  "role": "tenant"
}
```
- If the role is `landlord` then include `bussinessName`:


- If successful you should get the reponse:
- Status: '200 OK'
```
{
    "message": "User registered successfully",
    "success": true
}
```

## POST ../login Testing
- Description: Logs a user into the system.

- Click add request on Postman
- Select POST option, and paste http://127.0.0.1:5000/register in URL Box
- Select Header, in key type `content-Type` and in value type `application/json`
- Select Body select and RAW:
- Paste the following:
```
{
  "username": "ARegisteredUsername",
  "password": "password"
}
```
- If successful you should get the reponse:
- Status: '200 OK'
```
{
    "message": "Login successful",
    "success": true
}
```

> [!IMPORTANT]
> After Logging in, a cookie should generate under cookie reponse tab. This where your session cookie is stored that will be used for further testing.

## GET ../logout Testing
- Description: Logs a user out.

- Click add request on Postman
- Select POST option, and paste http://127.0.0.1:5000/logout in URL Box
- Select Header, in key type `content-Type` and in value type `application/json`
- Select Body select and RAW:
- Paste the following:
```
{
  "username": "RegisterUsername",
  "password": "testpassword"
}
```
- If successful you should get the reponse:
- Status: '200 OK'
```
{
    "message": "Login successful",
    "success": true
}
```
## GET ../api/user/profile Testing
- Description: Fetches the profile of the logged-in user.
- Send a GET request with a valid Authorization header.
```
{
  need to add code here
}
```
- If successful you should get the reponse:
- Status: '200 OK'
```
{
  need to add code here
}
```
## PUT ../api/user/update-profile Testing
- Need to add documentation
```
{
  need to add code here
}
```
## POST ../property/create Testing
- Need to add documentation
```
{
  need to add code here
}
```
## DELETE ../user/delete Testing
- Need to add documentation
```
{
  need to add code here
}
```
## GET ../api/properties Testing
- Need to add documentation
```
{
  need to add code here
}
```
## POST ../api/match Testing
- Need to add documentation
```
{
  need to add code here
}
```
# Frontend Testing
- Need to add info here :)
