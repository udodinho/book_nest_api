import { Test, TestingModule } from "@nestjs/testing"
import { getModelToken } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { User } from "../auth/schemas/user.schema"
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs"
import { ConflictException, UnauthorizedException } from "@nestjs/common";

describe("Authservice", () => {
    let authService: AuthService
    let model: Model<User>

    const mockUser = {
        "_id": "652026f695611e18cfcdd08a",
        "name": "Gamba",
        "email": "gamba@gmail.com",
        "password": "123456"
    };

    let token = "jwtToken"

    const mockAuthService = {
        create: jest.fn(),
        findOne: jest.fn(),
    }

    beforeEach(async () => {

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                JwtService,
                {
                    provide: getModelToken(User.name),
                    useValue: mockAuthService
                },
            ],
        }).compile()

        authService = module.get<AuthService>(AuthService)
        model = module.get<Model<User>>(getModelToken(User.name))
    });

    it("should be defined", () => {
        expect(authService).toBeDefined()
    });

    describe("signUp", () => {
        const signUpDto = {
            name: "Gamba",
            email: "gamba@gmail.com",
            password: "123456"
        }

        it("should register a user", async () => {
            jest.spyOn(bcrypt, "hash").mockReturnValue();

            mockAuthService.create = jest.fn().mockResolvedValueOnce(mockUser);

            const result = await authService.signUp(signUpDto)
            
            expect(result).toEqual(mockUser)
        });

        it("should throw duplicate email entered", async () => {
            mockAuthService.create = jest.fn().mockRejectedValueOnce({code: 11000})

            await expect(authService.signUp(signUpDto)).rejects.toThrow(ConflictException)
        });
    });

    describe("login", () => {
        const loginDto = {
            email: "gamba@gmail.com",
            password: "123456"
        }

        it("should login a user and return a token", async () => {
            jest.spyOn(bcrypt, "compare").mockReturnValue();

            mockAuthService.findOne = jest.fn().mockResolvedValueOnce(token)

            const result = await authService.login(loginDto)
            
            expect(result).toEqual({token})
        });

        it("should throw unauthorized when the user is not found", async () => {
            
            mockAuthService.findOne = jest.fn().mockResolvedValueOnce(null)

            expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException)
        });
    });
});   