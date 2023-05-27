import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';

export type ForgetPasswordDocument = ForgetPassword & Document;

@Schema()
export class ForgetPassword {
    @Prop({required: true})
    email: string
    @Prop({required: true})
    token: string
    @Prop({required: true})
    count: number
}

export const ForgetPasswordSchema = SchemaFactory.createForClass(ForgetPassword);
