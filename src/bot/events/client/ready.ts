import chalk from "chalk";
import { client } from "../..";
import Event from "../../structures/handlers/Event";

export default new Event('ready', () => {
    client.logger.success(`Logged in as ${chalk.reset.whiteBright(client.user!.tag)}`)
})