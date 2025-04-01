import ExtendedClient from "./structures/ExtendedClient";
export const client = new ExtendedClient();

export async function InitBot() {
    client.initBot();
}