import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Saúde')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Verifica o status da API' })
  @ApiResponse({ status: 200, description: 'API em funcionamento' })
  get() {
    return { data: { status: 'ok' }, error: null };
  }
}
