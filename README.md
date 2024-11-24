# Team 3 | Mobile Matching App

A matching app designed to work on IOS and Android
It is meant to be used for property owners, tenants and case handlers to ensure easier matches between possible tenants and housing for Section 8 housing vouchers

## Authors
- [@Jared](https://github.com/Cold-Change)
- [@Jeffrey](https://github.com/WillNav22)
- [@Kaan](https://github.com/TheKaanK)
- [@Matthew](https://github.com/mcolucci40)
- [@Phil](https://github.com/PhilPingPNG)

## Backen Testing w/ Postman:

- In terminal, change dir to backend: cd backend
- Create virtual environment: python -m venv venv
- Activate virtual environment
- Install libraries: pip install -r requirements.txt
- Start backend with 'flask run'

### POST ../Register Testing
- Click add request on Postman
- Select POST option, and paste http://127.0.0.1:5000/register in URL Box
- Select Body select and RAW:
- Paste the following:
```
{
  "username": "testuser1",
  "password": "testpassword",
  "firstName": "Test",
  "lastName": "User"
}
```
