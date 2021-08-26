import { myFamiliar } from "kolmafia";
import { $familiar, $item, $items, get, have } from "libram";
import { fairyFamiliar } from "./familiar";
import { baseMeat, BonusEquipMode, fairyMultiplier, leprechaunMultiplier, saleValue } from "./lib";

enum BjornModifierType {
  MEAT,
  ITEM,
  FMWT,
}

type BjornModifier = {
  type: BjornModifierType;
  modifier: number;
};

type BjornedFamiliar = {
  familiar: Familiar;
  meatVal: () => number;
  probability: number;
  modifier?: BjornModifier;
  dropPredicate?: () => boolean;
};

const bjornFams: BjornedFamiliar[] = [
  {
    familiar: $familiar`Puck Man`,
    meatVal: () => saleValue($item`yellow pixel`),
    probability: 0.25,
    dropPredicate: () => get("_yellowPixelDropsCrown") < 25,
  },
  {
    familiar: $familiar`Ms. Puck Man`,
    meatVal: () => saleValue($item`yellow pixel`),
    probability: 0.25,
    dropPredicate: () => get("_yellowPixelDropsCrown") < 25,
  },
  {
    familiar: $familiar`Grimstone Golem`,
    meatVal: () => saleValue($item`grimstone mask`),
    probability: 0.5,
    dropPredicate: () => get("_grimstoneMaskDropsCrown") < 1,
  },
  {
    familiar: $familiar`Knob Goblin Organ Grinder`,
    meatVal: () => 30,
    probability: 1,
    modifier: {
      type: BjornModifierType.MEAT,
      modifier: 25,
    },
  },
  {
    familiar: $familiar`Happy Medium`,
    meatVal: () => 30,
    probability: 1,
    modifier: {
      type: BjornModifierType.MEAT,
      modifier: 25,
    },
  },
  {
    familiar: $familiar`Garbage Fire`,
    meatVal: () => saleValue($item`burning newspaper`),
    probability: 0.5,
    dropPredicate: () => get("_garbageFireDropsCrown") < 3,
  },
  {
    familiar: $familiar`Machine Elf`,
    meatVal: () =>
      saleValue(
        ...$items`abstraction: sensation, abstraction: thought, abstraction: action, abstraction: category, abstraction: perception, abstraction: purpose`
      ),
    probability: 0.2,
    dropPredicate: () => get("_abstractionDropsCrown") < 25,
  },
  {
    familiar: $familiar`Trick-or-Treating Tot`,
    meatVal: () => saleValue($item`hoarded candy wad`),
    probability: 0.5,
    dropPredicate: () => get("_hoardedCandyDropsCrown") < 3,
  },
  {
    familiar: $familiar`Warbear Drone`,
    meatVal: () => saleValue($item`warbear whosit`),
    probability: 1 / 4.5,
  },
  {
    familiar: $familiar`Li'l Xenomorph`,
    meatVal: () => saleValue($item`lunar isotope`),
    probability: 0.05,
    modifier: {
      type: BjornModifierType.ITEM,
      modifier: 15,
    },
  },
  {
    familiar: $familiar`Pottery Barn Owl`,
    meatVal: () => saleValue($item`volcanic ash`),
    probability: 0.1,
  },
  {
    familiar: $familiar`Grim Brother`,
    meatVal: () => saleValue($item`grim fairy tale`),
    probability: 1,
    dropPredicate: () => get("_grimFairyTaleDropsCrown") < 2,
  },
  {
    familiar: $familiar`Optimistic Candle`,
    meatVal: () => saleValue($item`glob of melted wax`),
    probability: 1,
    dropPredicate: () => get("_optimisticCandleDropsCrown") < 3,
    modifier: {
      type: BjornModifierType.ITEM,
      modifier: 15,
    },
  },
  {
    familiar: $familiar`Adventurous Spelunker`,
    meatVal: () =>
      saleValue(
        ...$items`teflon ore, velcro ore, vinyl ore, cardboard ore, styrofoam ore, bubblewrap ore`
      ),
    probability: 1,
    dropPredicate: () => get("_oreDropsCrown") < 6,
    modifier: {
      type: BjornModifierType.ITEM,
      modifier: 15,
    },
  },
  {
    familiar: $familiar`Twitching Space Critter`,
    meatVal: () => saleValue($item`space beast fur`),
    probability: 1,
    dropPredicate: () => get("_spaceFurDropsCrown") < 1,
  },
  {
    familiar: $familiar`Party Mouse`,
    meatVal: () => 50,
    /*
    The below code is more accurate. However, party mouse is virtually never going to be worthwhile and this causes so many useless mall hits it isn't funny.

      saleValue(
        ...Item.all().filter(
          (booze) =>
            ["decent", "good"].includes(booze.quality) &&
            booze.inebriety > 0 &&
            booze.tradeable &&
            booze.discardable &&
            !$items`glass of "milk", cup of "tea", thermos of "whiskey", Lucky Lindy, Bee's Knees, Sockdollager, Ish Kabibble, Hot Socks, Phonus Balonus, Flivver, Sloppy Jalopy`.includes(
              booze
            )
        )
      ),
      */
    probability: 0.05,
  },
  {
    familiar: $familiar`Yule Hound`,
    meatVal: () => saleValue($item`candy cane`),
    probability: 1,
  },
  {
    familiar: $familiar`Gluttonous Green Ghost`,
    meatVal: () => saleValue(...$items`bean burrito, enchanted bean burrito, jumping bean burrito`),
    probability: 1,
  },
  {
    familiar: $familiar`Reassembled Blackbird`,
    meatVal: () => saleValue($item`blackberry`),
    probability: 1,
    modifier: {
      type: BjornModifierType.ITEM,
      modifier: 10,
    },
  },
  {
    familiar: $familiar`Reconstituted Crow`,
    meatVal: () => saleValue($item`blackberry`),
    probability: 1,
    modifier: {
      type: BjornModifierType.ITEM,
      modifier: 10,
    },
  },
  {
    familiar: $familiar`Hunchbacked Minion`,
    meatVal: () =>
      saleValue(
        ...$items`disembodied brain, skeleton bone, skeleton bone, skeleton bone, skeleton bone`
      ),
    probability: 1,
  },
  {
    familiar: $familiar`Reanimated Reanimator`,
    meatVal: () => saleValue(...$items`hot wing, broken skull`),
    probability: 1,
  },
  {
    familiar: $familiar`Attention-Deficit Demon`,
    meatVal: () =>
      saleValue(...$items`chorizo brownies, white chocolate and tomato pizza, carob chunk noodles`),
    probability: 1,
    modifier: {
      type: BjornModifierType.MEAT,
      modifier: 20,
    },
  },
  {
    familiar: $familiar`Piano Cat`,
    meatVal: () => saleValue(...$items`beertini, papaya slung, salty slug, tomato daiquiri`),
    probability: 1,
    modifier: {
      type: BjornModifierType.MEAT,
      modifier: 20,
    },
  },
  {
    familiar: $familiar`Golden Monkey`,
    meatVal: () => 100,
    probability: 0.5,
    modifier: {
      type: BjornModifierType.MEAT,
      modifier: 25,
    },
  },
  {
    familiar: $familiar`Robot Reindeer`,
    meatVal: () => saleValue(...$items`candy cane, eggnog, fruitcake, gingerbread bugbear`),
    probability: 0.3,
  },
  {
    familiar: $familiar`Stocking Mimic`,
    meatVal: () =>
      saleValue(
        ...$items`Angry Farmer candy, Cold Hots candy, Rock Pops, Tasty Fun Good rice candy, Wint-O-Fresh mint`
      ),
    probability: 0.3,
  },
  {
    familiar: $familiar`BRICKO chick`,
    meatVal: () => saleValue($item`BRICKO brick`),
    probability: 1,
  },
  {
    familiar: $familiar`Cotton Candy Carnie`,
    meatVal: () => saleValue($item`cotton candy pinch`),
    probability: 1,
  },
  {
    familiar: $familiar`Untamed Turtle`,
    meatVal: () => saleValue(...$items`snailmail bits, turtlemail bits, turtle wax`),
    probability: 0.35,
  },
  {
    familiar: $familiar`Astral Badger`,
    meatVal: () => 2 * saleValue(...$items`spooky mushroom, Knob mushroom, Knoll mushroom`),
    probability: 1,
  },
  {
    familiar: $familiar`Green Pixie`,
    meatVal: () => saleValue($item`bottle of tequila`),
    probability: 0.2,
  },
  {
    familiar: $familiar`Angry Goat`,
    meatVal: () => saleValue($item`goat cheese pizza`),
    probability: 1,
  },
  {
    familiar: $familiar`Adorable Seal Larva`,
    meatVal: () =>
      saleValue(
        ...$items`stench nuggets, spooky nuggets, hot nuggets, cold nuggets, sleaze nuggets`
      ),
    probability: 0.35,
  },
  {
    familiar: $familiar`Ancient Yuletide Troll`,
    meatVal: () => saleValue(...$items`candy cane, eggnog, fruitcake, gingerbread bugbear`),
    probability: 0.3,
  },
  {
    familiar: $familiar`Sweet Nutcracker`,
    meatVal: () => saleValue(...$items`candy cane, eggnog, fruitcake, gingerbread bugbear`),
    probability: 0.3,
  },
  {
    familiar: $familiar`Casagnova Gnome`,
    meatVal: () => 0,
    probability: 0,
    modifier: {
      type: BjornModifierType.MEAT,
      modifier: 20,
    },
  },
  {
    familiar: $familiar`Coffee Pixie`,
    meatVal: () => 0,
    probability: 0,
    modifier: {
      type: BjornModifierType.MEAT,
      modifier: 20,
    },
  },
  {
    familiar: $familiar`Dancing Frog`,
    meatVal: () => 0,
    probability: 0,
    modifier: {
      type: BjornModifierType.MEAT,
      modifier: 20,
    },
  },
  {
    familiar: $familiar`Grouper Groupie`,
    meatVal: () => 0,
    probability: 0,
    modifier: {
      type: BjornModifierType.MEAT,
      modifier: 20,
    },
  },
  {
    familiar: $familiar`Hand Turkey`,
    meatVal: () => 30,
    probability: 1,
    modifier: {
      type: BjornModifierType.MEAT,
      modifier: 20,
    },
  },
  {
    familiar: $familiar`Hippo Ballerina`,
    meatVal: () => 0,
    probability: 0,
    modifier: {
      type: BjornModifierType.MEAT,
      modifier: 20,
    },
  },
  {
    familiar: $familiar`Jitterbug`,
    meatVal: () => 0,
    probability: 0,
    modifier: {
      type: BjornModifierType.MEAT,
      modifier: 20,
    },
  },
  {
    familiar: $familiar`Leprechaun`,
    meatVal: () => 30,
    probability: 1,
    modifier: {
      type: BjornModifierType.MEAT,
      modifier: 20,
    },
  },
  {
    familiar: $familiar`Obtuse Angel`,
    meatVal: () => 0,
    probability: 0,
    modifier: {
      type: BjornModifierType.MEAT,
      modifier: 20,
    },
  },
  {
    familiar: $familiar`Psychedelic Bear`,
    meatVal: () => 0,
    probability: 0,
    modifier: {
      type: BjornModifierType.MEAT,
      modifier: 20,
    },
  },
  {
    familiar: $familiar`Robortender`,
    meatVal: () => 0,
    probability: 0,
    modifier: {
      type: BjornModifierType.MEAT,
      modifier: 20,
    },
  },
  {
    familiar: $familiar`Ghost of Crimbo Commerce`,
    meatVal: () => 30,
    probability: 1,
    modifier: {
      type: BjornModifierType.MEAT,
      modifier: 25,
    },
  },
  {
    familiar: $familiar`Hobo Monkey`,
    meatVal: () => 0,
    probability: 0,
    modifier: {
      type: BjornModifierType.MEAT,
      modifier: 25,
    },
  },
  {
    familiar: $familiar`Rockin' Robin`,
    meatVal: () => 60,
    probability: 1,
    modifier: {
      type: BjornModifierType.ITEM,
      modifier: 15,
    },
  },
  {
    familiar: $familiar`Feral Kobold`,
    meatVal: () => 30,
    probability: 1,
    modifier: {
      type: BjornModifierType.ITEM,
      modifier: 15,
    },
  },
  {
    familiar: $familiar`Oily Woim`,
    meatVal: () => 30,
    probability: 1,
    modifier: {
      type: BjornModifierType.ITEM,
      modifier: 10,
    },
  },
  {
    familiar: $familiar`Cat Burglar`,
    meatVal: () => 0,
    probability: 0,
    modifier: {
      type: BjornModifierType.ITEM,
      modifier: 10,
    },
  },
  {
    familiar: $familiar`Misshapen Animal Skeleton`,
    meatVal: () => 30,
    probability: 1,
    modifier: {
      type: BjornModifierType.FMWT,
      modifier: 5,
    },
  },
  {
    familiar: $familiar`Gelatinous Cubeling`,
    meatVal: () => 0,
    probability: 0,
    modifier: {
      type: BjornModifierType.FMWT,
      modifier: 5,
    },
  },
  {
    familiar: $familiar`Frozen Gravy Fairy`,
    // drops a cold nugget every combat, 5 of which can be used to make a cold wad
    meatVal: () => Math.max(0.2 * saleValue($item`cold wad`), saleValue($item`cold nuggets`)),
    probability: 1,
  },
  {
    familiar: $familiar`Stinky Gravy Fairy`,
    // drops a stench nugget every combat, 5 of which can be used to make a stench wad
    meatVal: () => Math.max(0.2 * saleValue($item`stench wad`), saleValue($item`stench nuggets`)),
    probability: 1,
  },
  {
    familiar: $familiar`Sleazy Gravy Fairy`,
    // drops a sleaze nugget every combat, 5 of which can be used to make a sleaze wad
    meatVal: () => Math.max(0.2 * saleValue($item`sleaze wad`), saleValue($item`sleaze nuggets`)),
    probability: 1,
  },
  {
    familiar: $familiar`Spooky Gravy Fairy`,
    // drops a spooky nugget every combat, 5 of which can be used to make a spooky wad
    meatVal: () => Math.max(0.2 * saleValue($item`spooky wad`), saleValue($item`spooky nuggets`)),
    probability: 1,
  },
  {
    familiar: $familiar`Flaming Gravy Fairy`,
    // drops a hot nugget every combat, 5 of which can be used to make a hot wad
    meatVal: () => Math.max(0.2 * saleValue($item`hot wad`), saleValue($item`hot nuggets`)),
    probability: 1,
  },
].filter((bjornFam) => have(bjornFam.familiar));

const bjornLists: Map<BonusEquipMode, BjornedFamiliar[]> = new Map();

function generateBjornList(mode: BonusEquipMode): BjornedFamiliar[] {
  const additionalValue = (familiar: BjornedFamiliar) => {
    if (!familiar.modifier) return 0;
    const meatVal = [BonusEquipMode.DMT, BonusEquipMode.FREE].includes(mode)
      ? 0
      : baseMeat + (mode === BonusEquipMode.EMBEZZLER ? 750 : 0);
    const itemVal = mode === BonusEquipMode.BARF ? 72 : 0;
    if (familiar.modifier.type === BjornModifierType.MEAT)
      return (familiar.modifier.modifier * meatVal) / 100;
    if (familiar.modifier.type === BjornModifierType.ITEM)
      return (familiar.modifier.modifier * itemVal) / 100;
    if (familiar.modifier.type === BjornModifierType.FMWT) {
      const lepMult = leprechaunMultiplier(fairyFamiliar());
      const fairyMult = fairyMultiplier(fairyFamiliar());
      return (
        (meatVal * (10 * lepMult + 5 * Math.sqrt(lepMult)) +
          itemVal * (5 * fairyMult + 2.5 * Math.sqrt(fairyMult))) /
        100
      );
    }
    return 0;
  };
  return [...bjornFams].sort(
    (a, b) =>
      (!b.dropPredicate ||
      (b.dropPredicate() && ![BonusEquipMode.EMBEZZLER, BonusEquipMode.DMT].includes(mode))
        ? b.meatVal() * b.probability
        : 0) +
      additionalValue(b) -
      ((!a.dropPredicate ||
      (a.dropPredicate() && ![BonusEquipMode.EMBEZZLER, BonusEquipMode.DMT].includes(mode))
        ? a.meatVal() * a.probability
        : 0) +
        additionalValue(a))
  );
}

export function pickBjorn(mode: BonusEquipMode = BonusEquipMode.FREE): BjornedFamiliar {
  if (!bjornLists.has(mode)) {
    bjornLists.set(mode, generateBjornList(mode));
  }
  const bjornList = bjornLists.get(mode);
  if (bjornList) {
    while (bjornList[0].dropPredicate && !bjornList[0].dropPredicate()) bjornList.shift();
    if (myFamiliar() !== bjornList[0].familiar) return bjornList[0];
    while (bjornList[1].dropPredicate && !bjornList[1].dropPredicate()) bjornList.splice(1, 1);
    return bjornList[1];
  }
  throw new Error("Something went wrong while selecting a familiar to bjornify or crownulate");
}
