import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../guards/gql-auth.guard';
import { UserType } from '../../../application/dto/graphql/user.type';
import { UpdateProfileInput } from '../../../application/dto/graphql/auth.input';
import { IUserRepository } from '../../../domain/interfaces/user-repository.interface';

@Resolver(() => UserType)
export class UserResolver {
  constructor(private readonly userRepository: IUserRepository) {}

  @Query(() => UserType)
  @UseGuards(GqlAuthGuard)
  async me(@Context() context: any): Promise<UserType> {
    const userId = context.req.user.sub;
    const user = await this.userRepository.findById(userId);
    
    return {
      id: user.id,
      email: user.email,
      status: user.status,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  }

  @Mutation(() => UserType)
  @UseGuards(GqlAuthGuard)
  async updateProfile(
    @Args('input') input: UpdateProfileInput,
    @Context() context: any,
  ): Promise<UserType> {
    const userId = context.req.user.sub;
    const user = await this.userRepository.findById(userId);
    
    user.updateProfile(input.firstName, input.lastName);
    await this.userRepository.update(user);
    
    return {
      id: user.id,
      email: user.email,
      status: user.status,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  }
}
