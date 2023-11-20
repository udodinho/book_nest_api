import { Test, TestingModule } from "@nestjs/testing"
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { SignUpDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";

describe("AuthController", () => {
    let authService: AuthService
    let authController: AuthController

    const mockUser = {
        "_id": "652026f695611e18cfcdd08a",
        "name": "Gamba",
        "email": "gamba@gmail.com",
        "password": "123456"
    };

    let token = "jwtToken"

    const mockAuthService = {
        signUp: jest.fn(),
        login: jest.fn(),
    }

    beforeEach(async () => {

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService
                },
            ],
        }).compile()

        authService = module.get<AuthService>(AuthService)
        authController = module.get<AuthController>(AuthController)
    });
    
    it("should be defined", () => {
        expect(authController).toBeDefined();
    });

    describe("signUp", () => {
        it("should register a new user", async() => {
            const signUpDto = {
                name: "Gamba",
                email: "gamba@gmail.com",
                password: "123456"
            };

            mockAuthService.signUp = jest.fn().mockResolvedValueOnce({token});

            const result = await authController.signUp(signUpDto as SignUpDto);

            expect(authService.signUp).toHaveBeenCalled();
            expect(result).toEqual({token});
        });
    });

    describe("login", () => {
        it("should login user", async() => {
            const loginDto = {
                email: "gamba@gmail.com",
                password: "123456"
            };

            mockAuthService.login = jest.fn().mockResolvedValueOnce({token});

            const result = await authController.login(loginDto as LoginDto);

            expect(authService.login).toHaveBeenCalled();
            expect(result).toEqual({token});
        });
    });
});