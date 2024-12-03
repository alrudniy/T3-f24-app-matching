import unittest
from app import app, Base, engine, session, User, Property, Match
from flask import json
from werkzeug.security import generate_password_hash


class FlaskAppTestCase(unittest.TestCase):
    def setUp(self):
        # Set up the test database and Flask test client
        Base.metadata.create_all(engine)
        self.app = app
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

    def tearDown(self):
        # Drop all data after each test
        session.rollback()
        session.close()
        Base.metadata.drop_all(engine)

    def test_register_landlord(self):
        response = self.client.post('/register', json={
            'username': 'landlord_username',
            'email': 'landlord@test.com',
            'phone': '1234567890',
            'password': 'password123',
            'firstName': 'Landlord',
            'lastName': 'Test',
            'role': 'landlord',
            'businessName': 'Test Business'
        })
        self.assertEqual(response.status_code, 201)
        self.assertIn('User registered successfully', response.json.get('message'))

    def test_register_tenant(self):
        response = self.client.post('/register', json={
            'username': 'tenant_username',
            'email': 'tenant@test.com',
            'phone': '9876543210',
            'password': 'password123',
            'firstName': 'Tenant',
            'lastName': 'Test',
            'role': 'tenant'
        })
        self.assertEqual(response.status_code, 201)
        self.assertIn('User registered successfully', response.json.get('message'))

    def test_login_user(self):
        self.test_register_tenant()  # Register a tenant first
        response = self.client.post('/login', json={
            'username': 'tenant_username',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('Login successful', response.json.get('message'))

    def test_create_property(self):
        # Register and login as a landlord
        self.test_register_landlord()
        login_response = self.client.post('/login', json={
            'username': 'landlord_username',
            'password': 'password123'
        })
        self.assertEqual(login_response.status_code, 200)

        # Create a property
        response = self.client.post('/property/create', json={
            'name': 'Test Property',
            'size_sqft': 1200,
            'price': 1500,
            'bedrooms': 3,
            'bathrooms': 2,
            'street_address': '123 Main St',
            'city': 'Testville'
        })
        self.assertEqual(response.status_code, 201)
        self.assertIn('Property created successfully', response.json.get('message'))

    def test_get_properties(self):
        # Ensure a property exists
        self.test_create_property()

        # Retrieve all properties
        response = self.client.get('/api/properties')
        self.assertEqual(response.status_code, 200)

        properties = response.json.get('properties')
        self.assertTrue(len(properties) > 0, "No properties found")

    def test_match_property(self):
        # Register and login as a tenant
        self.test_register_tenant()
        login_response = self.client.post('/login', json={
            'username': 'tenant_username',
            'password': 'password123'
        })
        self.assertEqual(login_response.status_code, 200)

        # Create a property as a landlord
        self.test_register_landlord()
        landlord_login_response = self.client.post('/login', json={
            'username': 'landlord_username',
            'password': 'password123'
        })
        self.assertEqual(landlord_login_response.status_code, 200)

        property_response = self.client.post('/property/create', json={
            'name': 'Test Property',
            'size_sqft': 1200,
            'price': 1500,
            'bedrooms': 3,
            'bathrooms': 2,
            'street_address': '123 Main St',
            'city': 'Testville'
        })
        self.assertEqual(property_response.status_code, 201)

        # Match the property as a tenant
        tenant_login_response = self.client.post('/login', json={
            'username': 'tenant_username',
            'password': 'password123'
        })
        self.assertEqual(tenant_login_response.status_code, 200)

        response = self.client.post('/api/match', json={
            'property_id': 1  # Assuming the first property ID is 1
        })
        self.assertEqual(response.status_code, 201)
        self.assertIn('Property matched successfully', response.json.get('message'))


if __name__ == '__main__':
    unittest.main()
