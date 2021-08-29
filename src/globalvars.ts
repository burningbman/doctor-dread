import { inebrietyLimit, myAdventures, myInebriety, myTurncount } from "kolmafia";
import { $item, have } from "libram";

export const log = {
  initialEmbezzlersFought: 0,
  digitizedEmbezzlersFought: 0,
};

export const globalOptions: {
  ascending: boolean;
  stopTurncount: number | null;
  nightcap: boolean;
} = {
  stopTurncount: null,
  ascending: false,
  nightcap: false,
};

export function estimatedTurns(): number {
  return globalOptions.stopTurncount
    ? globalOptions.stopTurncount - myTurncount()
    : (myAdventures() + (globalOptions.ascending && myInebriety() <= inebrietyLimit() ? 60 : 0)) *
        (have($item`mafia thumb ring`) ? 1.04 : 1);
}
