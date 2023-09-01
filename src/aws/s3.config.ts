import {Injectable} from '@nestjs/common';
import {ConfigService} from "@nestjs/config/dist/config.service";

@Injectable()
export class S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
    this.secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');
    this.region = this.configService.get('AWS_BUCKET_REGION');
    this.bucketName = this.configService.get('AWS_BUCKET_NAME');
  }
}
