import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { CANCEL } from "bdsx/common";
import { events } from "bdsx/event";

let regex = /^((NO LOG FILE! - )|())(\[)[0-9]{4}(-)[1-12]{2}(-)[0-31]{2}( )(?:[01]\d|2[0-3]):(?:[0-5]\d):(?:[0-5]\d)(:)[0-9]{1,5}( INFO\] ).{0,}$/;

const getPrefix = (service: string) => {
    const date = new Date();
    const time = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
    return `${time.cyan} [${service}]`
};

events.serverLog.on((log, color) => {
    if (log.includes("Running AutoCompaction")) return CANCEL;

    let message = log;
    if (regex.test(log)) {
        message = log.split("INFO] ")[1];
    }

    console.log(getPrefix("Server"), message);
    return CANCEL;
});

events.packetBefore(MinecraftPacketIds.Text).on((packet, netId, packetId) => {
    console.log(getPrefix("Chat"), `<${packet.name}> ${packet.message}`);
})

events.command.on((command, name, ctx) => {
    console.log(getPrefix("Command"), `<${name}> ${command}`);
})