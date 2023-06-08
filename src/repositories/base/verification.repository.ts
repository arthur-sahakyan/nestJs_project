import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {BaseRepository} from './base.repository';
import {
  Verification,
  VerificationDocument,
} from '../../auth/schemas/verification.schema';

@Injectable()
export class VerificationRepository extends BaseRepository<VerificationDocument> {
  constructor(
    @InjectModel(Verification.name)
    private readonly forgetPasswordDocumentModel: Model<VerificationDocument>,
  ) {
    super(forgetPasswordDocumentModel);
  }
}
