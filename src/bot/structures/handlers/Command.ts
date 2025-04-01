import ICommand from "../../../typings/interfaces/ICommand";

export class Command {
    constructor(commandOptions: ICommand) {
        Object.assign(this, commandOptions);
    }
}