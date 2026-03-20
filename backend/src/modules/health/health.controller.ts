import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  get() {
    return { data: { status: 'ok' }, error: null };
  }
}
