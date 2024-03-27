const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const randomEmail = require("random-email");
const User = require('../models/UserModel'); // replace with the actual path to your User model
const {Signup, Login} = require('../controllers/AuthController'); // replace with the actual path to your Signup controller
require("dotenv").config();

/* Connecting to the database before all tests. */
beforeAll(async () => {
  await mongoose.connect("mongodb://localhost/unit_test");
});

/* Closing database connection after all tests. */
afterAll(async () => {
  // Drop (delete) the database before closing the session.
  // Without this it would cause errors when running the tests again.
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});


describe("POST /signup", () => {

  it("Should create a user sucessfully", async () => {
    const userInfo = {
      email: randomEmail({ domain: "unittest.com" }),
      username: "johndoe",
      password: "asdASD123!@#",
    };

    const response = await request(app)
      .post("/auth/signup")
      .send(userInfo);

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("User signed in successfully");
    expect(response.body.success).toBe(true);
    expect(response.body.user.email).toBe(userInfo.email);
    expect(response.body.user.username).toBe(userInfo.username);
    expect(response.body.user.password).not.toBe(userInfo.password);
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it("Should not create a user if an email already exists", async () => {
    const userInfo = {
      email: "testing1@testing.com",
      username: "testuser",
      password: "asdASD123!@#",
    };

    // Create an initial user
    await request(app)
      .post("/auth/signup")
      .send(userInfo);

    // Attempt to create a user with the same email
    const response = await request(app)
      .post("/auth/signup")
      .send(userInfo);
    
    expect(response.statusCode).toBe(409);
    expect(response.body.message).toBe("User with this email already exists");
    expect(response.headers['set-cookie']).not.toBeDefined();
  });

  it("Should return 400 if user did not provided all fields", async () => {
    const userInfo = {
      email: "testing1@testing.com",
      password: "asdASD123!@#",
    };

    // Attempt to create a user without all required fields
    const response = await request(app)
      .post("/auth/signup")
      .send(userInfo);
    
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("There is a missing field in the request");
  });


  it('Should handle internal server error (500) for signup', async () => {

    let findOne = User.findOne;
    findOne = jest.fn(() => {
      throw new Error('Test error');
    });

    req = {
      body: {
        email: 'test@example.com',
        password: 'asdASD123!@#',
        username: 'testuser',
        createdAt: Date.now()
      }
    };

    res = {
      status: jest.fn(() => res),
      json: jest.fn()
    };
    next = jest.fn();

    await Signup(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
  });
});

describe("POST /login", () => {
  it("Should login a user sucessfully", async () => {
    const userInfo = {
      email: "logintest@test.ca",
      username: "logintestuser",
      password: "asdASD123!@#",
    };

    //Create a user
    await request(app)
      .post("/auth/signup")
      .send(userInfo);

    //login the user
    const response = await request(app)
      .post("/auth/login")
      .send({ email: userInfo.email, password: userInfo.password });
    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("User logged in successfully");
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it("Should require all fields", async () => {

    //login the user
    const response = await request(app)
      .post("/auth/login")
      .send({ email: 'sampleemail@email.com' });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("All fields are required");
    expect(response.headers['set-cookie']).not.toBeDefined();
  });

  it("Should return that no user is registered with given email", async () => {

    //login the user
    const response = await request(app)
      .post("/auth/login")
      .send({ email: 'thisemaildoesnotexist@email.com', password: 'asdASD123!@#' });
    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("No user registered with this email");
    expect(response.headers['set-cookie']).not.toBeDefined();
  });

  it("Should return incorrect password", async () => {
    const userInfo = {
      email: "incorrectpasswordtest@test.ca",
      username: "incorrectpasswordtest",
      password: "asdASD123!@#",
    };

    //Create a user
    await request(app)
      .post("/auth/signup")
      .send(userInfo);

    //login the user
    const response = await request(app)
      .post("/auth/login")
      .send({ email: userInfo.email, password: 'ASDasd123!@#' });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Incorrect password");
    expect(response.headers['set-cookie']).not.toBeDefined();
  });

  it('Should handle internal server error (500) for login', async () => {

    // Mocking User.findOne to throw an error
    let findOne = User.findOne;
    findOne = jest.fn(() => {
      throw new Error('Test error');
    });

    let req = {
      body: {
        email: 'test@example.com',
        password: 'asdASD123!@#',
        username: 'testuser',
        createdAt: Date.now()
      }
    };

    let res = {
      status: jest.fn(() => res),
      json: jest.fn()
    };
    let next = jest.fn();

    await Login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
  });
});



