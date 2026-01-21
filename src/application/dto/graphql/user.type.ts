import { ObjectType, Field, ID } from '@nestjs/graphql';
import { UserStatus } from '../../../domain/entities/user.entity';

@ObjectType()
export class UserType {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field(() => String)
  status: UserStatus;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field()
  emailVerified: boolean;

  @Field()
  createdAt: Date;
}
