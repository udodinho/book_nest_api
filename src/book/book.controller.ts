import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { BookService } from './book.service';
import { Book } from './schemas/book.schema';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Query as ExpressQuery } from "express-serve-static-core"
import { AuthGuard } from '@nestjs/passport';

@Controller('books')
export class BookController {
    constructor( private bookService: BookService) {}

    @Get()
    @UseGuards(AuthGuard())
    async getAllBooks(
        @Query() 
        query: ExpressQuery,
        @Req()
        req
    ): Promise<Book[]> {
        return await this.bookService.findAll(query, req.user);
    }

    @Post()
    @UseGuards(AuthGuard())
    async createBook(
        @Body()
        book: CreateBookDto,
        @Req()
        req        
    ): Promise<Book> {
        return await this.bookService.create(book, req.user)
    }

    @Get(":id")
    @UseGuards(AuthGuard())
    async getBook(
        @Param("id")
        id: string,
        @Req()
        req
    ): Promise<Book> {
        return await this.bookService.findById(id, req.user);
    }

    @Put(":id")
    @UseGuards(AuthGuard())
    async updateBook(
        @Param("id")
        id: string,
        @Body()
        book: UpdateBookDto,
        @Req()
        req
    ): Promise<Book> {    
        return await this.bookService.update(id, book, req.user)
    }

    @Delete(":id")
    @UseGuards(AuthGuard())
    async deleteBook(
        @Param("id")
        id: string,
        @Req()
        req
    ): Promise<{ msg: string }> {
        return await this.bookService.delete(id, req.user);
    }
}


// // TypeOrmModule.forRoot( DatabaseConfig() as ConnectOptions),
// @Module({
//     imports: [GraphQLModule.forRoot({
//       autoSchemaFile: "schema.gql"
//       }),
//       TypeOrmModule.forRoot( DatabaseConfig() as ConnectOptions),
//       BookModule,
//     ],
//     controllers: [AppController],
//     providers: [AppService],
//   })
//   export class AppModule {}