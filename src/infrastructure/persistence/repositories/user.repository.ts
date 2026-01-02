import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@core/prisma.service';
import { UserRepository } from '@domain/repositories/user.repository.interface';
import { User } from '@domain/entities/user.entity';
import { PrismaUserMapper } from '../mappers/user.mapper';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? PrismaUserMapper.toDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    return user ? PrismaUserMapper.toDomain(user) : null;
  }

  async save(user: User): Promise<User> {
    try {
      const data = PrismaUserMapper.toPrisma(user);
      const created = await this.prisma.user.create({
        data,
      });

      return PrismaUserMapper.toDomain(created);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already exists');
        }
      }
      throw error;
    }
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    try {
      const updated = await this.prisma.user.update({
        where: { id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          isActive: data.isActive,
          emailVerified: data.emailVerified,
          phoneVerified: data.phoneVerified,
          lastLogin: data.lastLogin,
          updatedAt: new Date(),
        },
      });

      return PrismaUserMapper.toDomain(updated);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('User not found');
        }
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('User not found');
        }
      }
      throw error;
    }
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email: email.toLowerCase() },
    });

    return count > 0;
  }
}
