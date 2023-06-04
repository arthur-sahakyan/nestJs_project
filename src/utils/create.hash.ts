import * as bcrypt from "bcrypt";
import * as process from "process";

/**
 * Create hash
 * @param data
 */
export function createHash(data: string): Promise<string | never> {
    return new Promise(((resolve, reject) => {
        bcrypt.hash(data, +process.env.SALT, function (err:never, hash:string) {
            if (err) {
                reject(err);
            }
            resolve(hash);
        });
    }));
}