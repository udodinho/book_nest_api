import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import mongoose from 'mongoose';
import { Category } from '../src/book/schemas/book.schema'

describe('Book Auth Controller (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
  
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    await mongoose.connection.db.dropDatabase()
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  const user = {
    name: "Gamba",
    email: "gamba@gmail.com",
    password: "123456"
  };

  const newBook = {
    "title": "Book 4",
    "description": "This is book 4",
    "author": "Caveman",
    "price": 200,
    "category": Category.ADVENTURE,
};

let jwtToken: string = ""
let bookCreated; 
let msg = "Deleted"

  describe("Auth", () => {
    it("(POST) - Register a new user", () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send(user)
        .expect(201)
        .then((res) => {
          expect(res.body.token).toBeDefined();
        });
    });
  
    it("(GET) - Login user", async () => {
      return request(app.getHttpServer())
        .get('/auth/signin')
        .send({email: user.email, password: user.password})
        .expect(200)
        .then((res) => {
          expect(res.body.token).toBeDefined();
          jwtToken  = res.body.token;
        });
      });
    })
    
    describe("Book", () => { 
      it("(POST) - Create a new book", () => {
        return request(app.getHttpServer())
        .post("/books")
        .set("Authorization", "Bearer " + jwtToken)
        .send(newBook)
        .expect(201)
        .then((res) => {
          expect(res.body._id).toBeDefined()
          expect(res.body.title).toEqual(newBook.title)
          bookCreated = res.body
        });
    })
    
    it("(GET) - Get all books", async () => {
      return request(app.getHttpServer())
        .get("/books")
        .set("Authorization", "Bearer " + jwtToken)
        .expect(200)
        .then((res) => {
          expect(res.body.length).toBe(1)
        });
    })
    
    it("(GET) - Get a single book by ID", async () => {
      return request(app.getHttpServer())
        .get(`/books/${bookCreated._id}`)
        .set("Authorization", "Bearer " + jwtToken)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeDefined()
          expect(res.body._id).toEqual(bookCreated._id)
        });
    });

    it("(PUT) - Update a book by ID", async () => {
      const book = { title: "Updated name"}
      return request(app.getHttpServer())
        .put(`/books/${bookCreated._id}`)
        .set("Authorization", "Bearer " + jwtToken)
        .send(book)
        .expect(200)
        .then((res) => {
          expect(res.body._id).toBeDefined()
          expect(res.body.title).toEqual(book.title)
        });
    })

    it("(DELETE) - Delete a book by ID", async () => {
      return request(app.getHttpServer())
        .delete(`/books/${bookCreated._id}`)
        .set("Authorization", "Bearer " + jwtToken)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeDefined()
          expect(res.body.deleted).toEqual(msg)
        });
    });
  });
});
