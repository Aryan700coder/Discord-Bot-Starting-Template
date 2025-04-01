import { ActivityType, Client, Collection, Options } from "discord.js"
import Logger from "../../utils/logger";
import * as emojis from '../../../config/emojis.json';
import * as config from '../../../config/config.json';
import Handler from "./handlers";
import ICommand from "../../typings/interfaces/ICommand";
import Database from "../database";
export default class ExtendedClient extends Client {
    logger = new Logger();
    commands!: Collection<string, ICommand>;
    constructor() {
        super({
            intents: 53608447,
            makeCache: Options.cacheEverything(),
            presence: {
                status: 'dnd',
                activities: [
                    {
                        name: 'Hello World',
                        type: ActivityType.Streaming,
                    },
                ],
            },
        });
    this.commands = new Collection();
    };
    private handler = new Handler(this);
    db = new Database(this);
    emoji = emojis;
    config = config;
    async initBot() {
        this.logger.info('Logging In...')
        this.login(this.config.token)
        .catch(error => this.logger.error(error));
        this.db.init();
        this.handler.LoadEvents();
        this.handler.LoadCommands().then(() => {
        this.handler.RegisterCommands();
        });
        }
};