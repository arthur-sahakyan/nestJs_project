import * as moment from "moment/moment";
import {BLOCK_MINUTES, TIME_FORMAT} from "../constants/auth.constants";

export function checkTimeDiff(time: string): number {

    return moment
        .utc(time, TIME_FORMAT)
        .diff(moment.utc(), 'minutes');
}

export function createDateTimeByMinutes(minutes: number): string {
    return moment
        .utc()
        .add(minutes, 'minutes')
        .format(TIME_FORMAT);
}