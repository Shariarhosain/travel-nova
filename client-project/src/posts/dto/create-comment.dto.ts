import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  commentText: string;
}

export class CreateReplyDto {
  @IsNotEmpty()
  @IsString()
  replyText: string;
}
