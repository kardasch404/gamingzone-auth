import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../guards/gql-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { RoleType } from '../../../application/dto/graphql/role.type';
import { CreateRoleUseCase } from '../../../application/use-cases/commands/create-role.use-case';
import { UpdateRoleUseCase } from '../../../application/use-cases/commands/update-role.use-case';
import { DeleteRoleUseCase } from '../../../application/use-cases/commands/delete-role.use-case';
import { CreateRoleCommand } from '../../../application/use-cases/commands/create-role.command';
import { UpdateRoleCommand } from '../../../application/use-cases/commands/update-role.command';
import { DeleteRoleCommand } from '../../../application/use-cases/commands/delete-role.command';
import { IRoleRepository } from '../../../domain/interfaces/role-repository.interface';

@Resolver(() => RoleType)
@UseGuards(GqlAuthGuard, RolesGuard)
@Roles('ADMIN')
export class RoleResolver {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
    private readonly deleteRoleUseCase: DeleteRoleUseCase,
  ) {}

  @Query(() => [RoleType])
  async roles(): Promise<RoleType[]> {
    const roles = await this.roleRepository.findAll();
    return roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      usersCount: 0,
      createdAt: role.createdAt,
    }));
  }

  @Mutation(() => RoleType)
  async createRole(
    @Args('name') name: string,
    @Args('description', { nullable: true }) description?: string,
  ): Promise<RoleType> {
    const command = new CreateRoleCommand(name, description);
    const result = await this.createRoleUseCase.execute(command);
    
    return {
      id: result.id,
      name: result.name,
      description: result.description,
      isSystem: result.isSystem,
      usersCount: 0,
      createdAt: result.createdAt,
    };
  }

  @Mutation(() => Boolean)
  async deleteRole(@Args('id') id: string): Promise<boolean> {
    const command = new DeleteRoleCommand(id);
    await this.deleteRoleUseCase.execute(command);
    return true;
  }
}
