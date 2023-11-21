import { Test, TestingModule } from "@nestjs/testing"
import { BookService } from "./book.service"
import { getModelToken } from "@nestjs/mongoose"
import { Book, Category } from "./schemas/book.schema"
import { BookController } from "./book.controller"
import { PassportModule } from "@nestjs/passport"
import { User } from "src/auth/schemas/user.schema"
import { CreateBookDto } from "./dto/create-book.dto"
import { UpdateBookDto } from "./dto/update-book.dto"

describe("BookController", () => {
    let bookService: BookService
    let bookController: BookController

    const mockBook = {
        "_id": "652182df467c194f5f290c75",
        "user": "652026f695611e18cfcdd08a",
        "title": "Book 4",
        "description": "This is book 4",
        "author": "Caveman",
        "price": 200,
        "category": Category.ADVENTURE,
    };

    const mockUser = {
        "_id": "652026f695611e18cfcdd08a",
        "name": "Gamba",
        "email": "gamba@gmail.com"
    }

    const mockBookService = {
        findAll: jest.fn().mockResolvedValueOnce([mockBook]),
        create: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
    }

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [PassportModule.register({ defaultStrategy: "jwt"})],
            controllers: [BookController],
            providers: [
                {
                    provide: BookService,
                    useValue: mockBookService,
                },
            ],
        }).compile()

        bookService = module.get<BookService>(BookService);
        bookController = module.get<BookController>(BookController);
    });

    it("should be defined", () => {
        expect(bookController).toBeDefined()
    });

    describe("getAllbooks", () => {
        it("should get all books", async () => {
            const result = await bookController.getAllBooks({ page: "1", keyword: "test"}, {user: mockUser as User})
            
            expect(bookService.findAll).toHaveBeenCalled();
            expect(result).toEqual([mockBook])
        });
    });

    describe("createbooks", () => {
        it("should create a new book", async () => {
            const newBook = {
                "title": "Book 4",
                "description": "This is book 4",
                "author": "Caveman",
                "price": 200,
                "category": Category.ADVENTURE,
            };

            mockBookService.create = jest.fn().mockResolvedValueOnce(mockBook);
            const result = await bookController.createBook(newBook as CreateBookDto, mockUser as User)

            expect(bookService.create).toHaveBeenCalled();
            expect(result).toEqual(mockBook)
        });
    });

    describe("getBookById", () => {
        it("should get a single book", async () => {
            mockBookService.findById = jest.fn().mockResolvedValueOnce(mockBook)
            const result = await bookController.getBook(mockBook._id, mockUser as User);

            expect(bookService.findById).toHaveBeenCalled();
            expect(result).toEqual(mockBook);
        });
    });

    describe("updateBook", () => {
        it("should update book by ID", async () => {
            const updatedBook = {...mockBook, title: "Updated name"};
            const updateBook = { title: "Updated name"};

            mockBookService.update = jest.fn().mockResolvedValueOnce(updatedBook)

            const result = await bookController.updateBook(mockBook._id, updateBook as UpdateBookDto, mockUser as User);

            expect(bookService.update).toHaveBeenCalled();
            expect(result).toEqual(updatedBook);
        });
    });

    describe("deleteBook", () => {
        it("should delete book by ID", async () => {
            mockBookService.delete = jest.fn().mockResolvedValueOnce(mockBook)
            const result = await bookController.deleteBook(mockBook._id, mockUser as User);

            expect(bookService.delete).toHaveBeenCalled();
            expect(result).toEqual(mockBook);
        });
    });

});