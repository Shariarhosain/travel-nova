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
  UploadedFile,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ItinerariesService } from '../services/itineraries.service';
import { CreateItineraryDto } from '../dto/create-itinerary.dto';
import { UpdateItineraryDto } from '../dto/update-itinerary.dto';
import { FileUploadService } from '../../file-upload/services/file-upload.service';

@Controller('itineraries')
export class ItinerariesController {
  constructor(
    private itinerariesService: ItinerariesService,
    private fileUploadService: FileUploadService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('mainImage'))
  async create(
    @Req() req: any,
    @Body() createDto: CreateItineraryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let mainImageLink: string | undefined;

    if (file) {
      mainImageLink = await this.fileUploadService.uploadSingle(file);
    }

    return this.itinerariesService.create(req.user.id, {
      ...createDto,
      mainImageLink: mainImageLink || createDto.mainImageLink,
    });
  }

  @Get()
  async findAll(
    @Req() req: any,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.itinerariesService.findAll(
      req.user?.id,
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 20,
    );
  }

  @Get('saved')
  @UseGuards(AuthGuard('jwt'))
  async getSavedItineraries(
    @Req() req: any,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.itinerariesService.getSavedItineraries(
      req.user.id,
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 20,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.itinerariesService.findOne(id, req.user?.id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() updateDto: UpdateItineraryDto,
  ) {
    return this.itinerariesService.update(id, req.user.id, updateDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.itinerariesService.remove(id, req.user.id);
  }

  @Post(':id/like')
  @UseGuards(AuthGuard('jwt'))
  async likeItinerary(@Param('id') id: string, @Req() req: any) {
    return this.itinerariesService.likeItinerary(id, req.user.id);
  }

  @Delete(':id/like')
  @UseGuards(AuthGuard('jwt'))
  async unlikeItinerary(@Param('id') id: string, @Req() req: any) {
    return this.itinerariesService.unlikeItinerary(id, req.user.id);
  }

  @Post(':id/save')
  @UseGuards(AuthGuard('jwt'))
  async saveItinerary(@Param('id') id: string, @Req() req: any) {
    return this.itinerariesService.saveItinerary(id, req.user.id);
  }

  @Delete(':id/save')
  @UseGuards(AuthGuard('jwt'))
  async unsaveItinerary(@Param('id') id: string, @Req() req: any) {
    return this.itinerariesService.unsaveItinerary(id, req.user.id);
  }
}
