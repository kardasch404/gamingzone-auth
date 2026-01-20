import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AssignPermissionsDto {
  @IsString()
  @IsNotEmpty()
  roleId: string;

  @IsArray()
  @IsNotEmpty()
  permissionIds: string[];
}
