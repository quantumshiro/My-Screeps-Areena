import { ATTACK, HEAL, RANGED_ATTACK, ERR_NOT_IN_RANGE } from "game/constants";
import { Creep, GameObject } from "game/prototypes";
import { findClosestByPath, getDirection, getObjectsByPrototype, getRange, getTicks } from "game/utils";
import { Flag } from "arena";
import { Visual } from "game/visual";
import { searchPath } from "game/path-finder";
import { createConnection } from "net";

declare module "game/prototypes" {
    interface Creep {
      initialPos: RoomPosition;
    }
}

export function loop() {
    const myCreeps: Creep[] = getObjectsByPrototype(Creep);
    const enemyCreeps: Creep[] = getObjectsByPrototype(Creep).filter(i => !i.my);
    const enemyFlag: Flag | undefined = getObjectsByPrototype(Flag).find(i => !i.my);

    const damegedCreeps: Creep[] = myCreeps.filter(i => i.hits < i.hitsMax);
    const attackerCreeps: Creep[] = myCreeps.filter(i => i.body.some(j => j.type === ATTACK || j.type === RANGED_ATTACK));

    for (const creep of myCreeps) {
        if (enemyCreeps.length == 0) {
            // no enemies, go enemies Flag
            if (enemyFlag) {
                creep.moveTo(enemyFlag);
            }
        }
        if (creep.body.some(v => v.type === HEAL)) {
            if (damegedCreeps.length > 0) {
                const damegedCreep = findClosestByPath(creep, damegedCreeps);
                if (creep.heal(damegedCreep) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(damegedCreep);
                }
            } else {
                const attacker = findClosestByPath(creep, attackerCreeps);
                creep.moveTo(attacker);
            }
        } else if (creep.body.some(v => v.type === RANGED_ATTACK)) {
            const enemyCreep = findClosestByPath(creep, enemyCreeps);
            if (creep.rangedAttack(enemyCreep) === ERR_NOT_IN_RANGE) {
                creep.moveTo(enemyCreep);
            }
        } else if (creep.body.some(v => v.type === ATTACK)) {
            const enemyCreep = findClosestByPath(creep, enemyCreeps);
            if (creep.attack(enemyCreep) === ERR_NOT_IN_RANGE) {
                creep.moveTo(enemyCreep);
            }
        }
    }
}
