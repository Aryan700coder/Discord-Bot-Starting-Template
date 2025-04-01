import { client } from "../..";
import Event from "../../structures/handlers/Event";

export default new Event('guildMemberRemove', async(member) => {
    const data = await client.db.user.getData(member.id, member.guild.id);

    if(!data) return;

    await client.db.user.deleteUser(member.id, member.guild.id);
})