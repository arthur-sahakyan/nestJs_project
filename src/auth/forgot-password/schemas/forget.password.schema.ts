import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, ObjectId} from 'mongoose';

export type ForgetPasswordDocument = ForgetPassword & Document;

@Schema()
export class ForgetPassword {
    @Prop({required: true})
    userId: ObjectId
    @Prop({required: true})
    token: string
    @Prop({required: true})
    cont: number
}

export const ForgetPasswordSchema = SchemaFactory.createForClass(ForgetPassword);
