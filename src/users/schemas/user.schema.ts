import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({required: true})
  name: string;

  @Prop({required: true})
  surname: string;

  @Prop({required: true})
  age: number;

  @Prop({required: true})
  email: string;

  @Prop({required: true})
  password: string;

  @Prop({required: true})
  roleType: string;

  @Prop({default: false})
  active: boolean
}

export const UserSchema = SchemaFactory.createForClass(User);
