import Database from "..";
import IUserSchema from "../interfaces/IUserSchema";
import userModel from "../schemas/userSchema";

export default class User {
    db: Database;
    constructor(db: Database) {
        this.db = db
    };

    async getData(userId: string, guildId: string):Promise<IUserSchema | undefined> {
        const data = await userModel.findOne({ userId, guildId })

        if(!data) return;
        const { cmdUses } = data;
        return {
            userId,
            guildId,
            cmdUses
        };
    };

    async createUser(userId: string, guildId: string):Promise<IUserSchema | undefined> {
        const data = await this.getData(userId, guildId);
        if(data) throw new Error(`You're trying to create Data, but it already exists`);

        const { cmdUses} = await new userModel({
            userId,
            guildId,
        }).save();

        return {
            userId,
            guildId,
            cmdUses,
        };
    };

    async updateUser(userId: string, guildId: string):Promise<IUserSchema | undefined> {
        const data = await this.getData(userId, guildId);
        if(!data) throw new Error(`There is no user`);

        const newData = await userModel.findOneAndUpdate({ userId, guildId }, {
            cmdUses: data.cmdUses+1
        });

        const { cmdUses } = newData as IUserSchema;

        return {
            userId,
            guildId,
            cmdUses,
        };
    }

    async deleteUser(userId: string, guildId: string):Promise<IUserSchema | Error> {
        const data = await this.getData(userId, guildId);
        if(!data) throw new Error(`That user doesn't exist`);

        const newData = await userModel.findOneAndDelete({ userId, guildId });

        if(!newData) throw new Error(`Something went wrong`);

        const { cmdUses } = newData;
        return {
            userId,
            guildId,
            cmdUses,
        };
    };
};