import { IsString, IsOptional, IsInt, MaxLength } from 'class-validator';

export class CreateFollowLogDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  followType?: string;

  @IsOptional()
  @IsInt()
  nextFollowDays?: number;

  @IsOptional()
  nextFollowTime?: Date;
}
