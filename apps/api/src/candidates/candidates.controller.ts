import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { CandidatesService } from './candidates.service'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtPayload } from '@tuyendung/types'

@ApiTags('Candidates')
@ApiBearerAuth()
@Controller('candidates')
export class CandidatesController {
  constructor(private candidatesService: CandidatesService) {}

  @Get()
  @ApiOperation({ summary: 'Tìm kiếm ứng viên (dành cho nhà tuyển dụng)' })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'skillIds', required: false, isArray: true })
  @ApiQuery({ name: 'openToWork', required: false, type: Boolean })
  @ApiQuery({ name: 'expectedSalaryMax', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  searchCandidates(
    @CurrentUser() user: JwtPayload,
    @Query('keyword') keyword?: string,
    @Query('city') city?: string,
    @Query('skillIds') skillIds?: string | string[],
    @Query('openToWork') openToWork?: string,
    @Query('expectedSalaryMax') expectedSalaryMax?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const skillArray = skillIds
      ? Array.isArray(skillIds) ? skillIds : [skillIds]
      : undefined

    return this.candidatesService.searchCandidates(user.sub, {
      keyword,
      city,
      skillIds: skillArray,
      openToWork: openToWork !== undefined ? openToWork === 'true' : undefined,
      expectedSalaryMax: expectedSalaryMax ? parseInt(expectedSalaryMax, 10) : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    })
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem profile công khai của ứng viên' })
  getCandidateProfile(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.candidatesService.getCandidatePublicProfile(id, user?.sub)
  }
}
