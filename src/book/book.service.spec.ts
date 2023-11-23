import { Test, TestingModule } from "@nestjs/testing"
import { BookService } from "./book.service"
import { getModelToken } from "@nestjs/mongoose"
import { Book, Category } from "./schemas/book.schema"
import mongoose, { Model } from "mongoose"
import { BadRequestException, NotFoundException } from "@nestjs/common"
import { User } from "src/auth/schemas/user.schema"
import { CreateBookDto } from "./dto/create-book.dto"

describe("Bookservice", () => {
    let bookService: BookService
    let model: Model<Book>

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
        find: jest.fn(),
        create: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findByIdAndDelete: jest.fn()
    }

    beforeEach(async () => {

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BookService, {
                    provide: getModelToken(Book.name),
                    useValue: mockBookService
                },
            ],
        }).compile()

        bookService = module.get<BookService>(BookService)
        model = module.get<Model<Book>>(getModelToken(Book.name))
    });

    describe("findAll", () => {

        it("should return an array of books", async () => {
            const query = { page: "1", keyword: "test" }

            jest.spyOn(model, "find").mockImplementation(() =>
            ({
                limit: () => ({
                    skip: jest.fn().mockResolvedValue([mockBook]),
                }),
            } as any),
            );

            const result = await bookService.findAll(query, mockUser as User)

            expect(model.find).toHaveBeenCalledWith({
                title: { $regex: "test", $options: "i" },
            });
            expect(result).toEqual([mockBook])
        });
    });

    describe("create", () => {

        it("should create and return a book", async () => {
            const newBook = {
                "title": "Book 4",
                "description": "This is book 4",
                "author": "Caveman",
                "price": 200,
                "category": Category.ADVENTURE,
            };

            mockBookService.create = jest.fn().mockResolvedValueOnce(mockBook);

            const result = await bookService.create(newBook as CreateBookDto, mockUser as User)

            expect(result).toEqual(mockBook)
        })
    })

    describe("findById", () => {

        it("should find and return a book by ID", async () => {
            jest.spyOn(model, "findById").mockResolvedValueOnce(mockBook)

            const result = await bookService.findById(mockBook._id, mockUser as User)

            expect(result).toEqual(mockBook)
        });

        it("should throw BadRequestException if invalid ID is provided", async () => {
            const id = "invalid-id";

            const isValidObjectIDMock = jest.spyOn(mongoose, "isValidObjectId").mockReturnValue(false)

            await expect(bookService.findById(id, mockUser as User)).rejects.toThrow(BadRequestException),
                expect(isValidObjectIDMock).toHaveBeenCalledWith(id);
            isValidObjectIDMock.mockRestore();
        })

        it("should throw NotFoundException if no book is found", async () => {
            mockBookService.findById = jest.fn().mockResolvedValueOnce(null)

            await expect(bookService.findById(mockBook._id, mockUser as User)).rejects.toThrow(NotFoundException),

                expect(model.findById).toBeCalled()
        });
    });

    describe("update", () => {
        it("should update and return a book", async () => {
            const updatedBook = {...mockBook, title: "Updated name"}
            const updateBook = { title: "Updated name"}

            mockBookService.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedBook)

            const result = await bookService.update(mockBook._id, updateBook as any, mockUser as User)

            expect(result.title).toEqual(updateBook.title)
        })
    })

    describe("delete", () => {
        it("should delete a book and return a success message", async () => {
            const msg = "Book deleted successfully"
            mockBookService.findByIdAndDelete = jest.fn().mockResolvedValue(mockBook)
    
                const result = await bookService.delete(mockBook._id, mockUser as User)
    
                expect(model.findByIdAndDelete).toHaveBeenCalledWith(mockBook._id, mockUser._id)
                expect(result).toEqual(msg)
        });
    });
});