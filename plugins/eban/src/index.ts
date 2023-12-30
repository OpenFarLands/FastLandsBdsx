import { events } from "bdsx/event";
import { command } from "bdsx/command";
import { PlayerCommandSelector, CommandPermissionLevel, CommandSelector, CommandOutput } from "bdsx/bds/command";
import { bedrockServer } from "bdsx/launcher";
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import * as db from "./database";
import { DisconnectPacket } from "bdsx/bds/packets";
import { CommandResultType } from "bdsx/commandresult";
import { CxxString } from "bdsx/nativetype";
import { Player } from "bdsx/bds/player";
import { CommandOrigin } from "bdsx/bds/commandorigin";

events.packetAfter(MinecraftPacketIds.Login).on((packet, netId, packetId) => {
    const connreq = packet.connreq;
    if (!connreq) return; //WRONG VERSION

    const value = connreq.getJsonValue();
    if (!value) return;

    let player: db.bannedPlayer = {
        name: value.ThirdPartyName,
        reason: "",
        deviceId: value.DeviceId,
        xuid: "", // Cannot be gotten from login packet
        ip: netId.getAddress().split("|")[0],
    };

    let banned = db.getBanned(player);

    if (banned) {
        if (banned.deviceId == "" || banned.ip == "" || banned.xuid == "") {
            return; // Player was banned offline so plugin will get full data after login.
        }

        let dp: DisconnectPacket = DisconnectPacket.allocate();
        dp.skipMessage = false;
        dp.message = banned.reason;
        dp.sendTo(netId);
        dp.dispose();
    }
});

events.playerJoin.on(event => {
    const pl = event.player;

    let player: db.bannedPlayer = {
        name: pl.getNameTag(),
        reason: "",
        deviceId: pl.deviceId,
        xuid: pl.getXuid(),
        ip: pl.getNetworkIdentifier().getAddress().split("|")[0],
    };

    let banned = db.getBanned(player);

    if (banned) {
        if (banned.deviceId == "" || banned.ip == "" || banned.xuid == "") {
            bedrockServer.executeCommand(`unban "PROROK ILON"`, CommandResultType.Mute);
            bedrockServer.executeCommand(`ban "PROROK ILON"`, CommandResultType.Mute);
            return;
        }

        let dp: DisconnectPacket = DisconnectPacket.allocate();
        dp.skipMessage = false;
        dp.message = banned.reason;
        dp.sendTo(pl.getNetworkIdentifier());
        dp.dispose();
    }
});

const banCmd = (
    param: {
        player: CommandSelector<Player>;
        reason: string;
    },
    output: CommandOutput,
) => {
    let reason = param.reason == undefined ? "Banned by admin" : param.reason;
    let target = bedrockServer.serverInstance.getPlayers().find(v => v.getNameTag() === param.player.getName());

    const bannedPlayer: db.bannedPlayer = {
        name: target == undefined ? param.player.getName() : target.getNameTag(),
        reason: reason,
        ip: target == undefined ? "" : target.getNetworkIdentifier().getAddress().split("|")[0],
        xuid: target == undefined ? "" : target.getXuid(),
        deviceId: target == undefined ? "" : target.deviceId,
    };

    if (db.addBanned(bannedPlayer)) {
        if (target) {
            let dp: DisconnectPacket = DisconnectPacket.allocate();
            dp.skipMessage = false;
            dp.message = reason;
            dp.sendTo(target.getNetworkIdentifier());
            dp.dispose();
        }

        output.addMessage("Player has been banned!");
    } else {
        output.addMessage("Player is already banned!");
    }
};

events.serverOpen.on(() => {
    db.init();

    command
        .register("ban", "ban a player", CommandPermissionLevel.Operator)
        .overload(
            (param, origin, output) => {
                banCmd(param, output);
            },
            { player: PlayerCommandSelector, reason: CxxString },
        )
        .overload(
            (param, origin, output) => {
                type params = {
                    player: CommandSelector<Player>;
                    reason: string;
                };

                let paramWithReason: params = {
                    player: param.player,
                    reason: "Banned by admin",
                };

                banCmd(paramWithReason, output);
            },
            { player: PlayerCommandSelector },
        );

    command.register("unban", "unban a player", CommandPermissionLevel.Operator).overload(
        (param, origin, output) => {
            let target = param.player.getName();

            if (db.removeBanned(target)) {
                output.addMessage("Player has been unbanned!");
            } else {
                output.addMessage("Player isn't banned!");
            }
        },
        { player: PlayerCommandSelector },
    );
});
