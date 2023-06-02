import * as bcrypt from "bcrypt";
import * as process from "process";

export function createHash(data: string): Promise<string> {
    return new Promise(((resolve, reject) => {
        bcrypt.hash(data, +process.env.SALT, function (err, hash) {
            if (err) {
                reject(err);
            }
            resolve(hash);
        });
    }));
}