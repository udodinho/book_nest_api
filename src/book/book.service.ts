import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Book } from './schemas/book.schema';
import * as mongoose from 'mongoose';
import { Query } from "express-serve-static-core"
import { User } from '../auth/schemas/user.schema';

@Injectable()
export class BookService {
    constructor(
        @InjectModel(Book.name)
        private bookModel: mongoose.Model<Book>,
    ) {}

    async findAll(query: Query, user: User): Promise<Book[]> {
        const resPerPage = 2
        const currPage = Number(query.page) || 1
        const skip = resPerPage * (currPage - 1)

        const keyword = query.keyword ? {
            title: {
                $regex: query.keyword,
                $options: "i"
            }
        } : {};

        const books = await this.bookModel.find({ user: user._id, ...keyword }).limit(resPerPage).skip(skip);

        return books
    }

    async create(book: Book, user: User): Promise<Book> {
        const data = Object.assign(book, { user: user._id })
        const res = await this.bookModel.create(data)
        return res
    }

    async findById(bookID: string, user: User): Promise<Book> {

        const isValidID = mongoose.isValidObjectId(bookID)

        if (!isValidID) {
            throw new BadRequestException("Please enter correct ID.")
        }

        const book = await this.bookModel.findById({ _id: bookID, user: user._id })

        if (!book) {
            throw new NotFoundException("Book not found.")
        }

        return book
    }

    async update(bookID: string, book: Book, user: User): Promise<Book> {
        const isValidID = mongoose.isValidObjectId(bookID)

        if (!isValidID) {
            throw new BadRequestException("Please enter correct ID.");
        }

        const newBook = await this.bookModel.findById({ _id: bookID, user: user._id });

        if (!newBook) {
            throw new NotFoundException("Book not found.")
        }

        const result = await this.bookModel.findByIdAndUpdate({ _id: bookID, user: user._id }, book, { new: true, runValidators: true });

        return result
    }

    async delete(bookID: string, user: User): Promise<{ msg: string}> {
        const book = await this.bookModel.findById({ _id: bookID, user: user._id })

        if (!book) {
            throw new NotFoundException("Book not found.")
        }

        await this.bookModel.findByIdAndDelete(bookID, user._id)
        return { msg: "Book deleted successfully" }
    }
    
}
