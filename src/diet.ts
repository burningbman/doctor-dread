import {
  availableAmount,
  buy,
  cliExecute,
  drink,
  eat,
  fullnessLimit,
  getFuel,
  getProperty,
  getWorkshed,
  haveEffect,
  inebrietyLimit,
  itemAmount,
  mallPrice,
  myClass,
  myFamiliar,
  myFullness,
  myInebriety,
  myLevel,
  mySpleenUse,
  print,
  retrieveItem,
  setProperty,
  spleenLimit,
  sweetSynthesis,
  toInt,
  use,
  useFamiliar,
  useSkill,
} from "kolmafia";
import { $class, $classes, $effect, $familiar, $item, $skill, get, have } from "libram";
import { acquire } from "./acquire";
import { globalOptions } from "./globalvars";
import { clamp, ensureEffect, setChoice } from "./lib";

const MPA = get("valueOfAdventure");
print(`Using adventure value ${MPA}.`, "blue");

function drinkSafe(qty: number, item: Item) {
  const prevDrunk = myInebriety();
  ensureEffect($effect`Ode to Booze`);
  acquire(qty, item);
  if (!drink(qty, item)) throw "Failed to drink safely";
  if (item.inebriety === 1 && prevDrunk === qty + myInebriety() - 1) {
    // sometimes mafia does not track the mime army shot glass property
    setProperty("_mimeArmyShotglassUsed", "true");
  }
}

function propTrue(prop: string | boolean) {
  if (typeof prop === "boolean") {
    return prop as boolean;
  } else {
    return get(prop);
  }
}

function useIfUnused(item: Item, prop: string | boolean, maxPrice: number) {
  if (!propTrue(prop)) {
    if (mallPrice(item) <= maxPrice) {
      acquire(1, item, maxPrice);
      use(1, item);
    } else {
      print(`Skipping ${item.name}; too expensive (${mallPrice(item)} > ${maxPrice}).`);
    }
  }
}

function fillSomeSpleen() {
  const needed = Math.floor(
    (haveEffect($effect`Riboflavin'`) - haveEffect($effect`Synthesis: Collection`)) / 30
  );
  sweetSynthesis(Math.min(needed, spleenLimit() - mySpleenUse()), $effect`Synthesis: Collection`);
}

function fillStomach() {
  if (myLevel() >= 15 && !get("_hungerSauceUsed") && mallPrice($item`Hunger™ Sauce`) < 3 * MPA) {
    acquire(1, $item`Hunger™ Sauce`, 3 * MPA);
    use(1, $item`Hunger™ Sauce`);
  }
  useIfUnused($item`milk of magnesium`, "_milkOfMagnesiumUsed", 5 * MPA);

  const count = fullnessLimit() - myFullness();
  if (getWorkshed() === $item`portable Mayo Clinic` && myFullness() < fullnessLimit()) {
    mindMayo(Mayo.flex, count);
  }
  // TODO: use munchies pills?
  acquire(count, $item`Special Seasoning`, MPA, false);
  eat(count, $item`devil hair pasta`);
}

function fillLiver() {
  if (have($item`portable Mayo Clinic`)) {
    if (getWorkshed() === $item`Asdon Martin keyfob`) {
      while (haveEffect($effect`Driving Observantly`) < 800) {
        if (getFuel() < 37) cliExecute("asdonmartin fuel 1 pie man was not meant to eat");
        cliExecute("asdonmartin drive observantly");
      }
    }
    use($item`portable Mayo Clinic`);
  }

  if (myFamiliar() === $familiar`Stooper`) {
    useFamiliar($familiar`none`);
  }

  if (!get("_mimeArmyShotglassUsed") && itemAmount($item`mime army shotglass`) > 0) {
    acquire(1, $item`black label`, 3 * MPA);
    drinkSafe(1, $item`bottle of vodka`);
  }

  const count = inebrietyLimit() - myInebriety();
  if (count === 0) return;
  if (getWorkshed() === $item`portable Mayo Clinic` && myFullness() < fullnessLimit()) {
    mindMayo(Mayo.diol, count);
    acquire(count, $item`Special Seasoning`, MPA, false);
    while (myInebriety() < inebrietyLimit()) {
      eat(
        Math.min(inebrietyLimit() - myInebriety(), fullnessLimit() - myFullness()),
        $item`devil hair pasta`
      );
    }
  } else {
    acquire(count, $item`black label`, 3 * MPA);
    drinkSafe(count, $item`bottle of vodka`);
  }
}

export function runDiet(): void {
  if ($item`bottle of vodka`.inebriety !== 1 || $item`devil hair pasta`.fullness !== 1) {
    throw "Something is wrong with our diet items. Wrong 2CRS seed?";
  }

  if (
    get("barrelShrineUnlocked") &&
    !get("_barrelPrayer") &&
    $classes`Turtle Tamer, Accordion Thief`.includes(myClass())
  ) {
    cliExecute("barrelprayer buff");
  }

  useIfUnused($item`fancy chocolate car`, get("_chocolatesUsed") !== 0, 2 * MPA);

  const loveChocolateCount = Math.max(3 - Math.floor(20000 / MPA) - get("_loveChocolatesUsed"), 0);
  const loveChocolateEat = Math.min(
    loveChocolateCount,
    itemAmount($item`LOV Extraterrestrial Chocolate`)
  );
  use(loveChocolateEat, $item`LOV Extraterrestrial Chocolate`);

  const chocos = new Map([
    [$class`Seal Clubber`, $item`chocolate seal-clubbing club`],
    [$class`Turtle Tamer`, $item`chocolate turtle totem`],
    [$class`Pastamancer`, $item`chocolate pasta spoon`],
    [$class`Sauceror`, $item`chocolate saucepan`],
    [$class`Accordion Thief`, $item`chocolate stolen accordion`],
    [$class`Disco Bandit`, $item`chocolate disco ball`],
  ]);
  const classChoco = chocos.get(myClass());
  const chocExpVal = (remaining: number, item: Item): number => {
    const advs = [0, 0, 1, 2, 3][remaining + (item === classChoco ? 1 : 0)];
    return advs * MPA - mallPrice(item);
  };
  const chocosRemaining = clamp(3 - get("_chocolatesUsed"), 0, 3);
  for (let i = chocosRemaining; i > 0; i--) {
    const chocoVals = Array.from(chocos.values()).map((choc) => {
      return {
        choco: choc,
        value: chocExpVal(i, choc),
      };
    });
    const best = chocoVals.sort((a, b) => b.value - a.value)[0];
    if (best.value > 0) use(1, best.choco);
    else break;
  }

  useIfUnused(
    $item`fancy chocolate sculpture`,
    get("_chocolateSculpturesUsed") < 1,
    5 * MPA + 5000
  );
  useIfUnused($item`essential tofu`, "_essentialTofuUsed", 5 * MPA);

  if (!get("_etchedHourglassUsed") && have($item`etched hourglass`)) {
    use(1, $item`etched hourglass`);
  }

  if (getProperty("_timesArrowUsed") !== "true" && mallPrice($item`time's arrow`) < 5 * MPA) {
    acquire(1, $item`time's arrow`, 5 * MPA);
    cliExecute("csend 1 time's arrow to botticelli");
    setProperty("_timesArrowUsed", "true");
  }

  if (have($skill`Ancestral Recall`) && mallPrice($item`blue mana`) < 3 * MPA) {
    const casts = Math.max(10 - get("_ancestralRecallCasts"), 0);
    acquire(casts, $item`blue mana`, 3 * MPA);
    useSkill(casts, $skill`Ancestral Recall`);
  }

  if (globalOptions.ascending) useIfUnused($item`borrowed time`, "_borrowedTimeUsed", 5 * MPA);

  fillLiver();
  fillStomach();

  if (!get("_distentionPillUsed") && 1 <= myInebriety()) {
    if (
      (have($item`distention pill`, 1) || !get<boolean>("duffo_skipPillCheck", false)) &&
      !use($item`distention pill`)
    ) {
      print("WARNING: Out of distention pills.", "red");
    }
  }

  if (!get("_syntheticDogHairPillUsed") && 1 <= myInebriety()) {
    if (
      (have($item`synthetic dog hair pill`, 1) || !get<boolean>("duffo_skipPillCheck", false)) &&
      !use($item`synthetic dog hair pill`)
    ) {
      print("WARNING: Out of synthetic dog hair pills.", "red");
    }
  }

  useIfUnused($item`spice melange`, "spiceMelangeUsed", 400000);

  fillLiver();
  fillStomach();

  fillSomeSpleen();
  const mojoFilterCount = 3 - get("currentMojoFilters");
  acquire(mojoFilterCount, $item`mojo filter`, 15000, false);
  if (have($item`mojo filter`)) {
    use(Math.min(mojoFilterCount, availableAmount($item`mojo filter`)), $item`mojo filter`);
    fillSomeSpleen();
  }
}

const Mayo = {
  nex: $item`Mayonex`,
  diol: $item`Mayodiol`,
  zapine: $item`Mayozapine`,
  flex: $item`Mayoflex`,
};

function mindMayo(mayo: Item, quantity: number) {
  if (getWorkshed() !== $item`portable Mayo Clinic`) return;
  if (get("mayoInMouth") && get("mayoInMouth") !== mayo.name)
    throw `You used a bad mayo, my friend!`; //Is this what we want?
  retrieveItem(quantity, mayo);
  if (!have($item`Mayo Minder™`)) buy($item`Mayo Minder™`);
  if (get("mayoMinderSetting") !== mayo.name) {
    setChoice(1076, toInt(mayo) - 8260);
    use($item`Mayo Minder™`);
  }
}
