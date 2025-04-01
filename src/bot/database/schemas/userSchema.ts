import { model, Schema } from "mongoose";
import IUserSchema from "../interfaces/IUserSchema";

const userSchema:Schema<IUserSchema> = new Schema({
    cmdUses: {
        type: Number,
        default: 0,
    },
    guildId: {
        type: String,
    },
    userId: {
        type: String,
    }
});

const userModel = model('user', userSchema);

export default userModel;