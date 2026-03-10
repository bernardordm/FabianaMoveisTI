/* eslint-disable */
import { Controller, Post, Body } from '@nestjs/common';
import { ReportsService } from '../service/reports.service';
import { DateRangeDto } from '../dto/date-range.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('by-date-range')
  getReportByDateRange(@Body() dateRange: DateRangeDto) {
    return this.reportsService.getReportByDateRange(dateRange);
  }
}