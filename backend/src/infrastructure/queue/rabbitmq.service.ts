import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleDestroy {
  private conn?: any;
  private channel?: any;
  private readonly logger = new Logger(RabbitMQService.name);
  private url = process.env.RABBITMQ_URL ?? 'amqp://localhost';

  private async connect() {
    if (this.conn && this.channel) return;
    this.logger.log(`Connecting to RabbitMQ ${this.url}`);
    try {
      this.conn = await (amqp as any).connect(this.url);
      this.channel = await this.conn.createChannel();
    } catch (err) {
      this.logger.error('Failed to connect to RabbitMQ', err as any);
      throw err;
    }
  }

  async publishToQueue(queue: string, msg: any) {
    await this.connect();
    if (!this.channel) throw new Error('RabbitMQ channel not available');
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)), { persistent: true });
  }

  async publishPrint(recipeId: string, payload: any = {}) {
    await this.publishToQueue('print_recipe', { recipeId, ...payload });
  }

  async onModuleDestroy() {
    try {
      if (this.channel) await this.channel.close();
      if (this.conn) await this.conn.close();
    } catch (err) {
      // ignore
    }
  }
}
