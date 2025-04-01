import { connect } from "mongoose";
import ExtendedClient from "../structures/ExtendedClient";
import User from "./classes/User";

export default class Database {

    client: ExtendedClient;
    user: User;
    constructor(client: ExtendedClient) {
        this.client = client;
        this.user = new User(client.db);
    };

    init() {
        this.client.logger.info(`Initiating connection with database...`);
        connect(this.client.config.dbURL)
        .then(() => this.client.logger.success(`✅ Successfully connected to database!`))
        .catch((error) => this.client.logger.error(`😵 Error while connecting to database: ${error}`));
    };

}