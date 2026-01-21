import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class RoleType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  isSystem: boolean;

  @Field(() => Int)
  usersCount: number;

  @Field()
  createdAt: Date;
}
