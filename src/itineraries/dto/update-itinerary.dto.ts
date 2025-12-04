import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateItineraryDto } from './create-itinerary.dto';

export class UpdateItineraryDto extends PartialType(
  OmitType(CreateItineraryDto, ['tags', 'bestTimeToVisit', 'attractions', 'hotels'] as const)
) {}
