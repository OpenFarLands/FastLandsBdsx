import { events } from "bdsx/event";
import { command } from "bdsx/command";
import { Player, ServerPlayer } from "bdsx/bds/player";
import { PlayerCommandSelector, CommandPermissionLevel } from "bdsx/bds/command";
import { bedrockServer } from "bdsx/launcher";
import { MinecraftPacketIds } from "bdsx/bds/packetids";

events.packetAfter(MinecraftPacketIds.Login).on((packet, netId, packetId) => {
    const connreq = packet.connreq;
    if (!connreq) return; //WRONG VERSION

    const value = connreq.getJsonValue();
    if (!value) return;
});

events.serverOpen.on(() => {
    command.register("eban", "ban a player", CommandPermissionLevel.Operator).overload(
        (param, origin, output) => {
            let target = bedrockServer.serverInstance.getPlayers().find(v => v.getNameTag() === param.player.getName());
            if (!target) return;

            const ip = target.getNetworkIdentifier().getAddress().split("|")[0];
            const xuid = target.getXuid();
            const uuid = target.getUuid();
            const deviceId = target.deviceId;
            const name = target.getNameTag();

        },
        { player: PlayerCommandSelector },
    );
});
