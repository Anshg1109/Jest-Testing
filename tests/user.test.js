const request = require('supertest');
const { app, server } = require('../server');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Mock the bcrypt hash function
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('mockedHashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));


describe('User Controller Tests', () => {
  let userId;

  beforeAll(async () => {
    const user = await User.create({
      name: 'Test',
      email: 'test@example.com',
      password: 'testpassword',
      phone: '741852963'
    });

    userId = user._id;

    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });
  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.disconnect();
    await server.close();
  });
  // Test for user registration input validation
  // Test for missing fields in registration
  it('should return 400 for missing fields in registration', async () => {
    const userData = {

    };
    const res = await request(app).post('/api/user/register').send(userData);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'All fields are mandatory!');
  });

  // Test for registering a new user successfully
  it('should successfully register a new user', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password23',
      phone: '1234567890',
      role: 'user' // Assuming there's a 'role' field in the schema
    };

    // Mock the bcrypt hash function to avoid hashing in tests
    jest.spyOn(bcrypt, 'hash').mockReturnValue('mockedHashedPassword');

    const res = await request(app).post('/api/user/register').send(userData);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('email', userData.email);
  });
  
  // Test for registering an already existing user
  it('should return 400 for registering an already existing user', async () => {
    const existingUser = {
      name: 'Existing User',
      email: 'existing@example.com',
      password: 'password123',
      phone: '9876543210',
      role: 'user'
    };
    await User.create(existingUser);

    const res = await request(app).post('/api/user/register').send(existingUser);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'User already registered!');
  });

  // Test loginUser function - valid credentials
  it('should login a user with valid credentials', async () => {
    const userData = {
      email: 'existing@example.com',
      password: 'password123'
    };
    const res = await request(app).post('/api/user/login').send(userData);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });


  // Test getUser function - Fetch all users
  it('should fetch all users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    // Add further assertions as needed for the fetched user data
  });

  // Test getUserById function - Fetch user by ID
  it('should fetch a user by ID', async () => {
  
    const res = await request(app).get(`/api/user/${userId}`);
    expect(res.status).toBe(200);
    // Add further assertions as needed for the fetched user data
  });

  // Test UpdateUser function for missing token 
  it('should not update a user', async () => {
    const updatedData = {
      phone: '852741963'
    };
    const res = await request(app).put(`/api/user/${userId}`).send(updatedData);
    expect(res.status).toBe(401);
  });


  // Test DeleteUser function for missing token field
  it('should return 401 for unauthorized operation', async () => {
    const res = await request(app).delete(`/api/user/${userId}`);
    expect(res.status).toBe(401);
  });


});
