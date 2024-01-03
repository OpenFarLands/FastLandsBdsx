import { punish, punishLevel } from "@bdsx/ada_anticheat/src/punish";
import { DimensionId } from "bdsx/bds/actor";
import { Vec3 } from "bdsx/bds/blockpos";
import { MinecraftPacketIds } from "bdsx/bds/packetids";
import { CANCEL } from "bdsx/common";
import { events } from "bdsx/event";
import { bedrockServer } from "bdsx/launcher";

const border = 10000;

events.packetBefore(MinecraftPacketIds.PlayerAuthInput).on((packet, netId, packetId) => {
    const pl = netId.getActor()!;
    const pos = packet.pos;
    if (pos.x > border || pos.x < border * -1 || pos.z > border || pos.z < border * -1) {
        const spawnPos = pl.hasRespawnPosition() ? pl.getSpawnPosition() : pl.getLevel().getDefaultSpawn();
        if (spawnPos.y > 1000) spawnPos.y = 80

        const tpPos = Vec3.allocate();
        tpPos.x = spawnPos.x;
        tpPos.y = spawnPos.y;
        tpPos.z = spawnPos.z;
        console.log(tpPos);
        //pl.teleport(tpPos, DimensionId.Overworld);
    }
});
