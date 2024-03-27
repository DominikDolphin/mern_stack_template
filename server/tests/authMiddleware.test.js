const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const { userVerification } = require("../Middlewares/AuthMiddleware"); // replace with the actual path to your Signup controller
const User = require("../Models/userModel");
const jwt = require("jsonwebtoken");

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

describe("userVerification", () => {
  it("Should return false if it has no token", async () => {
    const response = await request(app).post("/auth");

    expect(response.body.status).toEqual(false);
  });

  it("Should return false if the token is invalid", async () => {
    const response = await request(app)
      .post("/auth")
      .set("Cookie", "token=invalidtoken")
      .send();

    expect(response.body.status).toEqual(false);
  });

  it("Should succeed if a token is verified and associated to a user", async () => {
    const user = {
      username: "testuser",
      email: "testuser@test.ca",
      password: "Password123!",
    };

    const newUser = await request(app).post("/auth/signup").send(user);
    const token = newUser.header["set-cookie"][0].split(";")[0].split("=")[1];

    const response = await request(app)
      .post("/auth")
      .set("Cookie", `token=${token}`)
      .send();

    expect(response.body.status).toEqual(true);
    expect(response.body.user).toEqual(user.username);
  });

  it("should return status false if user is not found", async () => {
    const token = jwt.sign({ id: "nonexistentId" }, process.env.TOKEN_KEY);

    // Mock User.findById to return null
    jest.spyOn(User, "findById").mockImplementationOnce(() => null);

    const response = await request(app)
      .post("/auth") // replace with your actual route
      .set("Cookie", `token=${token}`)
      .send();

    expect(response.body.status).toBe(false);
  });
});
