import * as fs from "fs";

const path = "../banlist.json";

export type bannedPlayer = {
    name: string;
    reason: string;
    ip: string;
    xuid: string;
    deviceId: string;
};

export const init = () => {
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, "[]");
    }
};

export const addBanned = (banned: bannedPlayer): boolean => {
    banned.name = banned.name.toLowerCase();
    const readBanlist = fs.readFileSync(path).toString();
    let parsedBanlist: Array<bannedPlayer> = JSON.parse(readBanlist);

    if (isBanned(banned)) return false;

    parsedBanlist.push(banned);
    fs.writeFileSync(path, JSON.stringify(parsedBanlist, null, "\t"));

    return true;
};

export const removeBanned = (name: string): boolean => {
    name = name.toLowerCase();
    const readBanlist = fs.readFileSync(path).toString();
    let parsedBanlist: Array<bannedPlayer> = JSON.parse(readBanlist);

    const index = parsedBanlist.findIndex(v => v != undefined && v.name === name);
    if (index === -1) return false;

    parsedBanlist.splice(index, 1);

    fs.writeFileSync(path, JSON.stringify(parsedBanlist, null, "\t"));

    return true;
};

export const modifyBanned = (name: string, banned: bannedPlayer): boolean => {
    name = name.toLowerCase();
    banned.name = banned.name.toLowerCase();
    const readBanlist = fs.readFileSync(path).toString();
    let parsedBanlist: Array<bannedPlayer> = JSON.parse(readBanlist);

    const index = parsedBanlist.findIndex(v => v.name === name);
    if (index === -1) return false;

    parsedBanlist[index] = banned;
    fs.writeFileSync(path, JSON.stringify(parsedBanlist, null, "\t"));

    return true;
};

export const isBanned = (banned: bannedPlayer): boolean => {
    banned.name = banned.name.toLowerCase();
    const readBanlist = fs.readFileSync(path).toString();
    let parsedBanlist: Array<bannedPlayer> = JSON.parse(readBanlist);

    if (parsedBanlist.find(v => v.name === banned.name && v.name != "" || v.deviceId === banned.deviceId && v.deviceId != "" || v.ip === banned.ip && v.ip != "" || v.xuid === banned.xuid && v.xuid != "")) return true;

    return false;
};

export const getBanned = (banned: bannedPlayer): bannedPlayer | undefined => {
    banned.name = banned.name.toLowerCase();
    const readBanlist = fs.readFileSync(path).toString();
    let parsedBanlist: Array<bannedPlayer> = JSON.parse(readBanlist);

    if (!isBanned) return undefined;

    return parsedBanlist.find(v => v.name === banned.name || v.deviceId === banned.deviceId || v.ip === banned.ip || v.xuid === banned.xuid);
}