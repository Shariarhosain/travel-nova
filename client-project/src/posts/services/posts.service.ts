import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { CreateCommentDto, CreateReplyDto } from '../dto/create-comment.dto';
import { Visibility } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createPostDto: CreatePostDto) {
    const { tags, ...postData } = createPostDto;

    // Create post
    const post = await this.prisma.post.create({
      data: {
        ...postData,
        userAccountId: userId,
      },
    });

    // Handle tags
    if (tags && tags.length > 0) {
      await this.addTagsToPost(post.id, tags);
    }

    // Update user statistics
    await this.prisma.userStatistics.update({
      where: { userAccountId: userId },
      data: { totalPosts: { increment: 1 } },
    });

    return this.findOne(post.id, userId);
  }

  async findAll(userId?: string, skip = 0, take = 20) {
    const where: any = {
      status: 'ACTIVE',
    };

    // If user is logged in, show their posts + public posts + posts from users they follow
    if (userId) {
      const following = await this.prisma.following.findMany({
        where: { userId },
        select: { followingId: true },
      });

      const followingIds = following.map((f) => f.followingId);

      where.OR = [
        { userAccountId: userId },
        { visibility: Visibility.ALL },
        {
          visibility: Visibility.FOLLOWERS,
          userAccountId: { in: followingIds },
        },
      ];
    } else {
      where.visibility = Visibility.ALL;
    }

    const posts = await this.prisma.post.findMany({
      where,
      skip,
      take,
      include: {
        userAccount: {
          select: {
            id: true,
            fullName: true,
            profile: {
              select: {
                username: true,
                profileImage: true,
              },
            },
          },
        },
        postTags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            saves: true,
            shares: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.post.count({ where });

    return {
      data: posts.map((post) => ({
        ...post,
        tags: post.postTags.map((pt) => pt.tag),
        postTags: undefined,
        isLiked: false, // Will be calculated if userId provided
        isSaved: false,
      })),
      total,
      skip,
      take,
    };
  }

  async findOne(id: string, userId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        userAccount: {
          select: {
            id: true,
            fullName: true,
            profile: {
              select: {
                username: true,
                profileImage: true,
              },
            },
          },
        },
        postTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Increment view count
    await this.prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    let isLiked = false;
    let isSaved = false;

    if (userId) {
      const [like, save] = await Promise.all([
        this.prisma.postLike.findFirst({
          where: { postId: id, userAccountId: userId },
        }),
        this.prisma.postSave.findFirst({
          where: { postId: id, userAccountId: userId },
        }),
      ]);

      isLiked = !!like;
      isSaved = !!save;
    }

    return {
      ...post,
      tags: post.postTags.map((pt) => pt.tag),
      postTags: undefined,
      isLiked,
      isSaved,
    };
  }

  async update(id: string, userId: string, updatePostDto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userAccountId !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: updatePostDto,
    });

    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userAccountId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.post.update({
      where: { id },
      data: { status: 'DELETED' },
    });

    // Update user statistics
    await this.prisma.userStatistics.update({
      where: { userAccountId: userId },
      data: { totalPosts: { decrement: 1 } },
    });

    return { message: 'Post deleted successfully' };
  }

  async likePost(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingLike = await this.prisma.postLike.findFirst({
      where: { postId, userAccountId: userId },
    });

    if (existingLike) {
      return { message: 'Already liked' };
    }

    await this.prisma.$transaction([
      this.prisma.postLike.create({
        data: { postId, userAccountId: userId },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      }),
      this.prisma.notification.create({
        data: {
          userAccountId: post.userAccountId,
          type: 'like',
          content: 'liked your post',
          relatedUserId: userId,
          relatedPostId: postId,
        },
      }),
    ]);

    return { message: 'Post liked successfully' };
  }

  async unlikePost(postId: string, userId: string) {
    await this.prisma.$transaction([
      this.prisma.postLike.deleteMany({
        where: { postId, userAccountId: userId },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);

    return { message: 'Post unliked successfully' };
  }

  async savePost(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingSave = await this.prisma.postSave.findFirst({
      where: { postId, userAccountId: userId },
    });

    if (existingSave) {
      return { message: 'Already saved' };
    }

    await this.prisma.postSave.create({
      data: { postId, userAccountId: userId },
    });

    return { message: 'Post saved successfully' };
  }

  async unsavePost(postId: string, userId: string) {
    await this.prisma.postSave.deleteMany({
      where: { postId, userAccountId: userId },
    });

    return { message: 'Post unsaved successfully' };
  }

  async sharePost(postId: string, userId: string, sharedTo?: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.prisma.$transaction([
      this.prisma.postShare.create({
        data: { postId, userAccountId: userId, sharedTo },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: { shareCount: { increment: 1 } },
      }),
    ]);

    return { message: 'Post shared successfully' };
  }

  async createComment(postId: string, userId: string, dto: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = await this.prisma.$transaction(async (tx) => {
      const newComment = await tx.postComment.create({
        data: {
          postId,
          userAccountId: userId,
          commentText: dto.commentText,
        },
        include: {
          userAccount: {
            select: {
              id: true,
              fullName: true,
              profile: {
                select: {
                  username: true,
                  profileImage: true,
                },
              },
            },
          },
        },
      });

      await tx.post.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } },
      });

      if (post.userAccountId !== userId) {
        await tx.notification.create({
          data: {
            userAccountId: post.userAccountId,
            type: 'comment',
            content: 'commented on your post',
            relatedUserId: userId,
            relatedPostId: postId,
          },
        });
      }

      return newComment;
    });

    return comment;
  }

  async getComments(postId: string, skip = 0, take = 20) {
    const comments = await this.prisma.postComment.findMany({
      where: { postId },
      skip,
      take,
      include: {
        userAccount: {
          select: {
            id: true,
            fullName: true,
            profile: {
              select: {
                username: true,
                profileImage: true,
              },
            },
          },
        },
        _count: {
          select: {
            replies: true,
            likes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.postComment.count({ where: { postId } });

    return { data: comments, total, skip, take };
  }

  async likeComment(commentId: string, userId: string) {
    const comment = await this.prisma.postComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const existingLike = await this.prisma.commentLike.findFirst({
      where: { commentId, userAccountId: userId },
    });

    if (existingLike) {
      return { message: 'Already liked' };
    }

    await this.prisma.$transaction([
      this.prisma.commentLike.create({
        data: { commentId, userAccountId: userId },
      }),
      this.prisma.postComment.update({
        where: { id: commentId },
        data: { likeCount: { increment: 1 } },
      }),
    ]);

    return { message: 'Comment liked successfully' };
  }

  async unlikeComment(commentId: string, userId: string) {
    await this.prisma.$transaction([
      this.prisma.commentLike.deleteMany({
        where: { commentId, userAccountId: userId },
      }),
      this.prisma.postComment.update({
        where: { id: commentId },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);

    return { message: 'Comment unliked successfully' };
  }

  async createReply(commentId: string, userId: string, dto: CreateReplyDto) {
    const comment = await this.prisma.postComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const reply = await this.prisma.commentReply.create({
      data: {
        commentId,
        userAccountId: userId,
        replyText: dto.replyText,
      },
      include: {
        userAccount: {
          select: {
            id: true,
            fullName: true,
            profile: {
              select: {
                username: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    if (comment.userAccountId !== userId) {
      await this.prisma.notification.create({
        data: {
          userAccountId: comment.userAccountId,
          type: 'comment',
          content: 'replied to your comment',
          relatedUserId: userId,
          relatedPostId: comment.postId,
        },
      });
    }

    return reply;
  }

  async getReplies(commentId: string, skip = 0, take = 20) {
    const replies = await this.prisma.commentReply.findMany({
      where: { commentId },
      skip,
      take,
      include: {
        userAccount: {
          select: {
            id: true,
            fullName: true,
            profile: {
              select: {
                username: true,
                profileImage: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const total = await this.prisma.commentReply.count({
      where: { commentId },
    });

    return { data: replies, total, skip, take };
  }

  async getUserPosts(userId: string, skip = 0, take = 20) {
    const posts = await this.prisma.post.findMany({
      where: {
        userAccountId: userId,
        status: 'ACTIVE',
      },
      skip,
      take,
      include: {
        userAccount: {
          select: {
            id: true,
            fullName: true,
            profile: {
              select: {
                username: true,
                profileImage: true,
              },
            },
          },
        },
        postTags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.post.count({
      where: { userAccountId: userId, status: 'ACTIVE' },
    });

    return { data: posts, total, skip, take };
  }

  async getSavedPosts(userId: string, skip = 0, take = 20) {
    const savedPosts = await this.prisma.postSave.findMany({
      where: { userAccountId: userId },
      skip,
      take,
      include: {
        post: {
          include: {
            userAccount: {
              select: {
                id: true,
                fullName: true,
                profile: {
                  select: {
                    username: true,
                    profileImage: true,
                  },
                },
              },
            },
            postTags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await this.prisma.postSave.count({
      where: { userAccountId: userId },
    });

    return {
      data: savedPosts.map((sp) => sp.post),
      total,
      skip,
      take,
    };
  }

  private async addTagsToPost(postId: string, tagNames: string[]) {
    for (const tagName of tagNames) {
      // Find or create tag
      const tag = await this.prisma.tag.upsert({
        where: { tagName: tagName.toLowerCase() },
        update: {},
        create: { tagName: tagName.toLowerCase() },
      });

      // Create post tag relation
      await this.prisma.postTag.upsert({
        where: {
          postId_tagId: {
            postId,
            tagId: tag.id,
          },
        },
        update: {},
        create: {
          postId,
          tagId: tag.id,
        },
      });
    }
  }
}
