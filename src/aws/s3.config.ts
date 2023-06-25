import {Injectable} from '@nestjs/common';
import {ConfigService} from "@nestjs/config/dist/config.service";

@Injectable()
export class S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.accessKeyId = this.configService.get('YOUR_ACCESS_KEY_ID');
    this.secretAccessKey = this.configService.get('YOUR_SECRET_ACCESS_KEY');
    this.region = this.configService.get('YOUR_BUCKET_REGION');
    this.bucketName = this.configService.get('YOUR_BUCKET_NAME');
  }
}
