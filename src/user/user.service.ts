import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }
  create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({ data: createUserDto });
  }

  findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: {
        email
      }
    })
  }

  findAll({ offset, limit, keyword }) {
    return this.prisma.user.findMany({
      where: {
        ...(keyword && {
          full_name: {
            contains: keyword
          }
        })
      },
      ...(offset && { skip: parseInt(offset) }),
      ...(limit && { take: parseInt(limit) }),
      orderBy: { user_id: 'desc' }
    })
  }

  findOne(id: number) {
    return this.prisma.user.findFirst({
      where: {
        user_id: id
      }
    })
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      data: {
        ...updateUserDto
      },
      where: {
        user_id: id
      }
    })
  }

  remove(id: number) {
    return this.prisma.user.delete({
      where: {
        user_id: id
      }
    })
  }

  updateAvatar(id: number, path: string) {
    return this.prisma.user.update({
      data: {
        avatar: path
      },
      where: {
        user_id: id
      }
    })
  }
}
