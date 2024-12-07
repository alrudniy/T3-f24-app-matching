<h1 align="center">
<img
		width="500"
		alt="Team 3 | Mobile Matching App"
		src="https://raw.githubusercontent.com/alrudniy/T3-f24-app-matching/refs/heads/master/frontend/app/(main)/(home)/assets/images/logo.png?token=GHSAT0AAAAAACZJOM5EBL32YBFW6IZZ4EZ6Z2UYAZA">
</h1>
<h3 align="center">
# Team 3 | Mobile Matching App

A matching app designed to work on IOS and Android
It is meant to be used for property owners, tenants and case handlers to ensure easier matches between possible tenants and housing for Section 8 housing vouchers

## Authors
- [@Jared](https://github.com/Cold-Change)
- [@Jeffrey](https://github.com/WillNav22)
- [@Kaan](https://github.com/TheKaanK)
- [@Matthew](https://github.com/mcolucci40)
- [@Phil](https://github.com/PhilPingPNG)


## Screenshots

<img
		width="210"
		alt="Capture 1"
		src="https://github.com/alrudniy/T3-f24-app-matching/blob/master/preview_images/LoginPage.png">
<img
		width="210"
		alt="Capture 2"
		src="https://github.com/alrudniy/T3-f24-app-matching/blob/master/preview_images/AccountCreationPage.png">
<img
		width="210"
		alt="Capture 3"
		src="https://github.com/alrudniy/T3-f24-app-matching/blob/master/preview_images/PropertyCreationPage.png">
<img
		width="210"
		alt="Capture 4"
		src="https://github.com/alrudniy/T3-f24-app-matching/blob/master/preview_images/MatchingPage.png">

# Backend Testing w/ Postman:

- In terminal, change dir to backend: cd backend
- Create virtual environment: python -m venv venv
- Activate virtual environment
- Install libraries: pip install -r requirements.txt
- Start backend with 'flask run'

## POST ../register Testing
- Description: Registers a new user.
- 
- 
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
- 
- 
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
- 
- 
- Click add request on Postman
- Select GET option, and paste http://127.0.0.1:5000/logout in URL Box
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
- 
- 
- Click add request on Postman
- Select GET option, and paste http://127.0.0.1:5000/api/user/profile in URL Box
- Send a GET request with a valid Authorization header.
- 
- For Authorization header:
- Select Header, type `Cookie` and in value type `session=<tokenValue>`
- View  Login Testing to learn how to retrieve a session cookie

- If successful you should get the reponse:
- Status: '200 OK'
```
{
    "profile": {
        "businessName": null,
        "firstname": "FirstName",
        "id": 22,
        "lastname": "LastName",
        "profile_picture": null,
        "role": "tenant",
        "username": "TestTenant123"
    },
    "success": true
}
```
## PUT ../api/user/update-profile Testing
- Description: Allows users to update their profile information, such as name, and for landlords, their business name. Users can also upload a profile picture.
- 
- 
- Click add request on Postman
- Select PUT option, and paste http://127.0.0.1:5000/api/user/update-profile in URL Box
- Send a PUT request with a valid Authorization header.
- 
- For Authorization header:
- Select Header, type `Cookie` and in value type `session=<tokenValue>`
- View  Login Testing to learn how to retrieve a session cookie
- 
- Select Body select and RAW:
- Paste the following:
```
{
  "firstname": "NewFirst",
  "lastname": "NewLast"
}
```
- Optional for landlords: `businessName`:
- Optional: Upload a profile picture (profile_picture) ;This is used in frontend.
- 
- If successful you should get the reponse:
- Status: '200 OK'
``
{
    "message": "Profile updated successfully",
    "success": true
}
``
## POST ../property/create Testing
- Description:Allows landlords to create a property listing by providing details such as size, price bedrooms, and bathrooms.
- 
- 
- Click add request on Postman
- Select POST option, and paste http://127.0.0.1:5000/property/create in URL Box
- Send a POST request with a valid `landlord` Authorization header.
- 
- For Authorization header:
- Select Header, type `Cookie` and in value type `session=<tokenValue>`
- View  Login Testing to learn how to retrieve a session cookie
- 
- Select Body select and RAW:
- Paste the following:

```
{
    "size_sqft": 1200,
    "price": 1500.00,
    "bedrooms": 3,
    "bathrooms": 2
}
```
- If successful you should get the reponse:
- Status: '200 OK'
``
{
    "message": "Property created successfully",
    "success": true
}
``
## DELETE ../user/delete Testing
- Description: Deletes a user from the system by their ID.
- 
- 
- Select DELETE option, and paste http://127.0.0.1:5000/user/delete/<user_id> in URL Box
- Send a DELETE request with a valid `admin` Authorization header.
- If successful you should get the reponse:
- Status: '200 OK'
```
{
  need to add code here
}
```
## GET ../api/properties Testing
- Description: Allows tenants to view all property listings available in the system.
- 
- 
- Click add request on Postman
- Select GET option, and paste http://127.0.0.1:5000/api/properties in URL Box
- Send a GET request with a valid `tenant` Authorization header.
- 
- For Authorization header:
- Select Header, type `Cookie` and in value type `session=<tokenValue>`
- View  Login Testing to learn how to retrieve a session cookie
- 
- If successful you should get the reponse:
- Status: '200 OK'
```
{
    "properties": [
        {
            "bathrooms": 2,
            "bedrooms": 3,
            "id": 1,
            "price": 1500.0,
            "size_sqft": 1200.0,
            "user_id": 23
        }
    ],
    "success": true
}
```
## POST ../api/match Testing
- Description: Allows tenants to express interest in a property by marking it as "matched."
- 
- 
- Click add request on Postman
- Select POST option, and paste http://127.0.0.1:5000/api/match in URL Box
- Send a POST request with a valid `tenant` Authorization header.
- 
- Select Body select and RAW:
- Paste the following:
```
{
  need to add code here
}
```
# Frontend Testing
- Need to add info here :)
