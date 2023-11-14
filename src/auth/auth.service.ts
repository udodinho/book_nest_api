import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from "bcryptjs"
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>,
        private jwtService: JwtService,
    ) { }

    async signUp(signUpDto: SignUpDto): Promise<{ token: string }> {
        const { name, email, password } = signUpDto;

        try {
            const hashedPass = await bcrypt.hash(password, 10);

            const user = await this.userModel.create({
                name,
                email,
                password: hashedPass
            });

            const token = this.jwtService.sign({ id: user._id });

            return { token }

        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException("Duplicate email entered")
            }
        }
    }

    async login(loginDto: LoginDto): Promise<{ token: string }> {
        const { email, password } = loginDto;

        const user = await this.userModel.findOne({ email });

        if (!user) {
            throw new UnauthorizedException("Invalid email or password");
        }

        const isValidPass = await bcrypt.compare(password, user.password);

        if (!isValidPass) {
            throw new UnauthorizedException("Invalid email or password");
        }

        const token = this.jwtService.sign({ id: user._id });

        return { token }
    }
}
