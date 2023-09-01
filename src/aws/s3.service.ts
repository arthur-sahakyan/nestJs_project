import {Injectable} from '@nestjs/common';
import {S3} from 'aws-sdk';
import {S3Config} from "./s3.config";

@Injectable()
export class S3Service {
  private s3: S3;

  constructor(private readonly s3Config: S3Config) {
    this.s3 = new S3({
      accessKeyId: this.s3Config.accessKeyId,
      secretAccessKey: this.s3Config.secretAccessKey,
      region: this.s3Config.region,
    });
  }
  async fileUpload(file: Express.Multer.File): Promise<any> {
    const params = {
      Bucket: this.s3Config.bucketName,
      Key: file.originalname,
      Body: file.buffer,
    };

    const result = await this.s3.upload(params).promise();

    return {url: result.Location};
  }
}
