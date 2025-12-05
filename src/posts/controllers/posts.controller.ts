import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PostsService } from '../services/posts.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { CreateCommentDto, CreateReplyDto } from '../dto/create-comment.dto';
import { FileUploadService } from '../../file-upload/services/file-upload.service';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private fileUploadService: FileUploadService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('image', 10))
  async create(
    @Req() req: any,
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    let imageLinks: string[] = [];

    if (files && files.length > 0) {
      imageLinks = await this.fileUploadService.uploadMultiple(files);
    }

    return this.postsService.create(req.user.id, {
      ...createPostDto,
      imageLinks,
    });
  }

  @Get()
  async findAll(
    @Req() req: any,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.postsService.findAll(
      req.user?.id,
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 20,
    );
  }

  @Get('user/:userId')
  async getUserPosts(
    @Param('userId') userId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.postsService.getUserPosts(
      userId,
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 20,
    );
  }

  @Get('saved')
  @UseGuards(AuthGuard('jwt'))
  async getSavedPosts(
    @Req() req: any,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.postsService.getSavedPosts(
      req.user.id,
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 20,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.postsService.findOne(id, req.user?.id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, req.user.id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.postsService.remove(id, req.user.id);
  }

  @Post(':id/like')
  @UseGuards(AuthGuard('jwt'))
  async likePost(@Param('id') id: string, @Req() req: any) {
    return this.postsService.likePost(id, req.user.id);
  }

  @Delete(':id/like')
  @UseGuards(AuthGuard('jwt'))
  async unlikePost(@Param('id') id: string, @Req() req: any) {
    return this.postsService.unlikePost(id, req.user.id);
  }

  @Post(':id/save')
  @UseGuards(AuthGuard('jwt'))
  async savePost(@Param('id') id: string, @Req() req: any) {
    return this.postsService.savePost(id, req.user.id);
  }

  @Delete(':id/save')
  @UseGuards(AuthGuard('jwt'))
  async unsavePost(@Param('id') id: string, @Req() req: any) {
    return this.postsService.unsavePost(id, req.user.id);
  }

  @Post(':id/share')
  @UseGuards(AuthGuard('jwt'))
  async sharePost(
    @Param('id') id: string,
    @Req() req: any,
    @Body('sharedTo') sharedTo?: string,
  ) {
    return this.postsService.sharePost(id, req.user.id, sharedTo);
  }

  @Post(':id/comments')
  @UseGuards(AuthGuard('jwt'))
  async createComment(
    @Param('id') id: string,
    @Req() req: any,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.postsService.createComment(id, req.user.id, createCommentDto);
  }

  @Get(':id/comments')
  async getComments(
    @Param('id') id: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.postsService.getComments(
      id,
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 20,
    );
  }

  @Post('comments/:commentId/like')
  @UseGuards(AuthGuard('jwt'))
  async likeComment(@Param('commentId') commentId: string, @Req() req: any) {
    return this.postsService.likeComment(commentId, req.user.id);
  }

  @Delete('comments/:commentId/like')
  @UseGuards(AuthGuard('jwt'))
  async unlikeComment(@Param('commentId') commentId: string, @Req() req: any) {
    return this.postsService.unlikeComment(commentId, req.user.id);
  }

  @Post('comments/:commentId/replies')
  @UseGuards(AuthGuard('jwt'))
  async createReply(
    @Param('commentId') commentId: string,
    @Req() req: any,
    @Body() createReplyDto: CreateReplyDto,
  ) {
    return this.postsService.createReply(commentId, req.user.id, createReplyDto);
  }

  @Get('comments/:commentId/replies')
  async getReplies(
    @Param('commentId') commentId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.postsService.getReplies(
      commentId,
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 20,
    );
  }
}
