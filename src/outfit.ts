import {
  bjornifyFamiliar,
  cliExecute,
  enthroneFamiliar,
  equip,
  equippedAmount,
  fullnessLimit,
  getCounters,
  haveEquipped,
  inebrietyLimit,
  mallPrice,
  myClass,
  myFamiliar,
  myFullness,
  myInebriety,
  numericModifier,
  retrieveItem,
  toSlot,
  totalTurnsPlayed,
  visitUrl,
  weaponType,
} from "kolmafia";
import {
  $class,
  $familiar,
  $item,
  $items,
  $monster,
  $slot,
  $slots,
  $stat,
  get,
  getFoldGroup,
  getKramcoWandererChance,
  have,
  maximizeCached,
} from "libram";
import { pickBjorn } from "./bjorn";
import { estimatedTurns, globalOptions } from "./globalvars";
import { BonusEquipMode, gnomeWeightValue, Requirement, saleValue } from "./lib";

const bestAdventuresFromPants =
  Item.all()
    .filter(
      (item) =>
        toSlot(item) === $slot`pants` && have(item) && numericModifier(item, "Adventures") > 0
    )
    .map((pants) => numericModifier(pants, "Adventures"))
    .sort((a, b) => b - a)[0] || 0;

export function freeFightOutfit(requirements: Requirement[] = []): void {
  const equipMode =
    myFamiliar() === $familiar`Machine Elf` ? BonusEquipMode.DMT : BonusEquipMode.FREE;
  const bjornChoice = pickBjorn(equipMode);

  const forceEquip = [];
  if (myFamiliar() === $familiar`Reagnimated Gnome`) {
    // It is assumed you have the kgnee because I added gnome equips to dailies.
    forceEquip.push($item`gnomish housemaid's kgnee`);
  }

  const compiledRequirements = Requirement.merge([
    ...requirements,
    new Requirement(
      myFamiliar() === $familiar`Reagnimated Gnome`
        ? [`${gnomeWeightValue().toFixed(1)} Familiar Weight`]
        : myFamiliar() === $familiar`Pocket Professor`
        ? ["Familiar Experience"]
        : ["Familiar Weight"],
      {
        bonusEquip: new Map([...dropsItems(equipMode), ...pantsgiving(), ...cheeses()]),
      }
    ),
  ]);
  const bjornAlike =
    have($item`Buddy Bjorn`) &&
    !(
      compiledRequirements.maximizeOptions_.forceEquip &&
      compiledRequirements.maximizeOptions_.forceEquip.some(
        (equipment) => toSlot(equipment) === $slot`back`
      )
    )
      ? $item`Buddy Bjorn`
      : $item`Crown of Thrones`;
  const finalRequirements = compiledRequirements.merge(
    new Requirement([], {
      forceEquip,
      bonusEquip: new Map([
        [
          bjornAlike,
          !bjornChoice.dropPredicate || bjornChoice.dropPredicate()
            ? bjornChoice.meatVal() * bjornChoice.probability
            : 0,
        ],
      ]),
      preventEquip: [
        ...(bjornAlike === $item`Buddy Bjorn` ? $items`Crown of Thrones` : $items`Buddy Bjorn`),
        $item`Snow Suit`,
      ],
      preventSlot: $slots`crown-of-thrones, buddy-bjorn`,
    })
  );

  maximizeCached(finalRequirements.maximizeParameters(), finalRequirements.maximizeOptions());
  if (haveEquipped($item`Buddy Bjorn`)) bjornifyFamiliar(bjornChoice.familiar);
  if (haveEquipped($item`Crown of Thrones`)) enthroneFamiliar(bjornChoice.familiar);
  if (haveEquipped($item`Snow Suit`) && get("snowsuit") !== "nose") cliExecute("snowsuit nose");
}

export function refreshLatte(): boolean {
  // Refresh unlocked latte ingredients
  if (have($item`latte lovers member's mug`)) {
    visitUrl("main.php?latte=1", false);
  }

  return have($item`latte lovers member's mug`);
}

export const nepDefaultRequirement = new Requirement(["1 Item Drop"], {});
export function nepOutfit(requirement = nepDefaultRequirement): void {
  const extraObjectives = [];
  const forceEquip = [];
  const equipMode =
    getCounters("Digitize Monster", 0, 0) === "" ? BonusEquipMode.BARF : BonusEquipMode.FREE;
  const bjornChoice = pickBjorn(equipMode);

  if (myInebriety() > inebrietyLimit()) {
    forceEquip.push($item`Drunkula's wineglass`);
  } else {
    if (getKramcoWandererChance() > 0.99 && have($item`Kramco Sausage-o-Matic™`)) {
      forceEquip.push($item`Kramco Sausage-o-Matic™`);
    }
    // TODO: Fix pointer finger ring construction

    const forceMelee = requirement
      .maximizeOptions()
      .forceEquip?.some((item) => weaponType(item) === $stat`Muscle`);
    const forceRanged = requirement
      .maximizeOptions()
      .forceEquip?.some((item) => weaponType(item) === $stat`Moxie`);
    if (
      myClass() !== $class`Seal Clubber` &&
      globalOptions.preferredMonster === $monster`jock` &&
      !requirement.maximizeOptions().forceEquip?.includes($item`The Jokester's gun`)
    ) {
      if (have($item`haiku katana`) && !forceRanged) {
        forceEquip.push($item`haiku katana`, $item`mafia pointer finger ring`);
      } else if (have($item`unwrapped knock-off retro superhero cape`) && !forceMelee) {
        if (!have($item`ice nine`)) retrieveItem($item`ice nine`);
        forceEquip.push($item`ice nine`, $item`mafia pointer finger ring`);
      }
    }
    if (
      have($item`protonic accelerator pack`) &&
      get("questPAGhost") === "unstarted" &&
      get("nextParanormalActivity") <= totalTurnsPlayed() &&
      !forceEquip.includes($item`ice nine`)
    ) {
      forceEquip.push($item`protonic accelerator pack`);
    }
  }
  if (myFamiliar() === $familiar`Obtuse Angel`) {
    forceEquip.push($item`quake of arrows`);
    if (!have($item`quake of arrows`)) retrieveItem($item`quake of arrows`);
  }
  if (myFamiliar() === $familiar`Reagnimated Gnome`) {
    // It is assumed you have the kgnee because I added gnome equips to dailies.
    forceEquip.push($item`gnomish housemaid's kgnee`);
    extraObjectives.push(`${gnomeWeightValue().toFixed(1)} Familiar Weight`);
  }
  const bjornAlike =
    have($item`Buddy Bjorn`) && !forceEquip.some((item) => toSlot(item) === $slot`back`)
      ? $item`Buddy Bjorn`
      : $item`Crown of Thrones`;
  const compiledRequirements = requirement.merge(
    new Requirement(extraObjectives, {
      forceEquip,
      bonusEquip: new Map([
        ...dropsItems(equipMode),
        ...pantsgiving(),
        ...cheeses(),
        [
          bjornAlike,
          !bjornChoice.dropPredicate || bjornChoice.dropPredicate()
            ? bjornChoice.meatVal() * bjornChoice.probability
            : 0,
        ],
        [$item`Snow Suit`, -500], // This should ensure we only equip on last Bander stage.
      ]),
      preventEquip: [
        ...$items`broken champagne bottle, unwrapped knock-off retro superhero cape`,
        bjornAlike === $item`Buddy Bjorn` ? $item`Crown of Thrones` : $item`Buddy Bjorn`,
      ],
      preventSlot: $slots`crown-of-thrones, buddy-bjorn`,
    })
  );

  maximizeCached(compiledRequirements.maximizeParameters(), compiledRequirements.maximizeOptions());

  if (equippedAmount($item`ice nine`) > 0) {
    equip($item`unwrapped knock-off retro superhero cape`);
  }
  if (haveEquipped($item`Buddy Bjorn`)) bjornifyFamiliar(bjornChoice.familiar);
  if (haveEquipped($item`Crown of Thrones`)) enthroneFamiliar(bjornChoice.familiar);
  if (haveEquipped($item`Snow Suit`) && get("snowsuit") !== "nose") cliExecute("snowsuit nose");
}

const pantsgivingBonuses = new Map<number, number>();
function pantsgiving() {
  if (!have($item`Pantsgiving`)) return new Map<Item, number>();
  const count = get("_pantsgivingCount");
  const turnArray = [5, 50, 500, 5000];
  const index =
    myFullness() === fullnessLimit()
      ? get("_pantsgivingFullness")
      : turnArray.findIndex((x) => count < x);
  const turns = turnArray[index] || 50000;

  if (turns - count > estimatedTurns()) return new Map<Item, number>();

  const cachedBonus = pantsgivingBonuses.get(turns);
  if (cachedBonus) return new Map([[$item`Pantsgiving`, cachedBonus]]);

  const fullnessValue =
    get("valueOfAdventure") * 10 -
    (mallPrice($item`devil hair pasta`) + mallPrice($item`Special Seasoning`));
  const pantsgivingBonus = fullnessValue / (turns * 0.9);
  pantsgivingBonuses.set(turns, pantsgivingBonus);
  return new Map<Item, number>([[$item`Pantsgiving`, pantsgivingBonus]]);
}
const haveSomeCheese = getFoldGroup($item`stinky cheese diaper`).some((item) => have(item));
function cheeses() {
  return haveSomeCheese &&
    !globalOptions.ascending &&
    get("_stinkyCheeseCount") < 100 &&
    estimatedTurns() >= 100 - get("_stinkyCheeseCount")
    ? new Map<Item, number>(
        getFoldGroup($item`stinky cheese diaper`).map((item) => [
          item,
          get("valueOfAdventure") * (10 - bestAdventuresFromPants) * (1 / 100),
        ])
      )
    : [];
}

function snowSuit(equipMode: BonusEquipMode) {
  // Ignore for EMBEZZLER
  // Ignore for DMT, assuming mafia might get confused about the drop by the weird combats
  if (
    !have($item`Snow Suit`) ||
    get("_carrotNoseDrops") >= 3 ||
    [BonusEquipMode.EMBEZZLER, BonusEquipMode.DMT].some((mode) => mode === equipMode)
  )
    return new Map<Item, number>();

  return new Map<Item, number>([[$item`Snow Suit`, saleValue($item`carrot nose`) / 10]]);
}

function dropsItems(equipMode: BonusEquipMode) {
  const isFree = [BonusEquipMode.FREE, BonusEquipMode.DMT].includes(equipMode);
  return new Map<Item, number>([
    [$item`familiar scrapbook`, 50],
    [$item`mafia thumb ring`, !isFree ? 1000 : 0],
    [$item`lucky gold ring`, 400],
    [$item`Mr. Cheeng's spectacles`, 250],
    [$item`pantogram pants`, get("_pantogramModifier").includes("Drops Items") ? 100 : 0],
    [$item`Mr. Screege's spectacles`, 180],
    ...snowSuit(equipMode),
  ]);
}
