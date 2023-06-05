import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, SchemaTypes, Types} from 'mongoose';
import {User} from '../../users/schemas/user.schema';

export type VerificationDocument = Verification & Document;

@Schema()
export class Verification {
  @Prop({required: true, type: SchemaTypes.ObjectId, ref: User.name})
  userId: Types.ObjectId;
  @Prop({required: true})
  token: string;
  @Prop({required: false})
  time: string;
}

export const VerificationSchema = SchemaFactory.createForClass(Verification);
