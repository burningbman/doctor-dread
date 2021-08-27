import {
  availableAmount,
  buy,
  changeMcd,
  cliExecute,
  currentMcd,
  getCampground,
  getClanLounge,
  haveSkill,
  inebrietyLimit,
  itemAmount,
  mallPrice,
  maximize,
  myClass,
  myInebriety,
  myPrimestat,
  myThrall,
  print,
  putCloset,
  retrieveItem,
  runChoice,
  use,
  useFamiliar,
  useSkill,
  visitUrl,
} from "kolmafia";
import {
  $class,
  $coinmaster,
  $effect,
  $familiar,
  $familiars,
  $item,
  $items,
  $skill,
  $skills,
  $thrall,
  ChateauMantegna,
  get,
  have,
  property,
  SongBoom,
  SourceTerminal,
} from "libram";
import { fairyFamiliar } from "./familiar";
import { coinmasterPrice, saleValue, tryFeast } from "./lib";
import { withStash, withVIPClan } from "./clan";
import { refreshLatte } from "./outfit";

export function dailySetup(): void {
  voterSetup();
  martini();
  chateauDesk();
  gaze();
  configureGear();
  horse();
  prepFamiliars();
  dailyBuffs();
  configureMisc();
  volcanoDailies();
  cheat();
  tomeSummons();
  gin();
  internetMemeShop();
  pickTea();
  refreshLatte();

  if (myInebriety() > inebrietyLimit()) return;
  retrieveItem($item`Half a Purse`);
  retrieveItem($item`seal tooth`);
  retrieveItem($item`The Jokester's gun`);
  putCloset(itemAmount($item`hobo nickel`), $item`hobo nickel`);
  putCloset(itemAmount($item`sand dollar`), $item`sand dollar`);
  putCloset(itemAmount($item`4-d camera`), $item`4-d camera`);
  putCloset(itemAmount($item`unfinished ice sculpture`), $item`unfinished ice sculpture`);
}

function voterSetup(): void {
  if (have($item`"I Voted!" sticker`) || !(get("voteAlways") || get("_voteToday"))) return;
  visitUrl("place.php?whichplace=town_right&action=townright_vote");

  const votingMonsterPriority = [
    "terrible mutant",
    "angry ghost",
    "government bureaucrat",
    "annoyed snake",
    "slime blob",
  ];

  const initPriority = new Map<string, number>([
    ["Item Drop: +15", 10],
    ["Meat Drop: +30", 9],
    ["Familiar Experience: +2", 8],
    ["Adventures: +1", 7],
    ["Monster Level: +10", 5],
    [`${myPrimestat()} Percent: +25`, 3],
    [`Experience (${myPrimestat()}): +4`, 2],
    ["Meat Drop: -30", -2],
    ["Item Drop: -15", -2],
    ["Familiar Experience: -2", -2],
  ]);

  const monsterVote =
    votingMonsterPriority.indexOf(get("_voteMonster1")) <
    votingMonsterPriority.indexOf(get("_voteMonster2"))
      ? 1
      : 2;

  const voteLocalPriorityArr = [
    [0, initPriority.get(get("_voteLocal1")) || (get("_voteLocal1").indexOf("-") === -1 ? 1 : -1)],
    [1, initPriority.get(get("_voteLocal2")) || (get("_voteLocal2").indexOf("-") === -1 ? 1 : -1)],
    [2, initPriority.get(get("_voteLocal3")) || (get("_voteLocal3").indexOf("-") === -1 ? 1 : -1)],
    [3, initPriority.get(get("_voteLocal4")) || (get("_voteLocal4").indexOf("-") === -1 ? 1 : -1)],
  ];

  const bestVotes = voteLocalPriorityArr.sort((a, b) => b[1] - a[1]);
  const firstInit = bestVotes[0][0];
  const secondInit = bestVotes[1][0];

  visitUrl(
    `choice.php?option=1&whichchoice=1331&g=${monsterVote}&local[]=${firstInit}&local[]=${secondInit}`
  );
}

function configureGear(): void {
  if (!have($item`luck incense`) && have($familiar`Mu`)) {
    useFamiliar($familiar`Mu`);
    use($item`box of Familiar Jacks`);
  }

  if (have($item`Fourth of May Cosplay Saber`) && get("_saberMod") === 0) {
    // Get familiar weight.
    visitUrl("main.php?action=may4");
    runChoice(4);
  }

  if (have($item`Bastille Battalion control rig`) && get("_bastilleGames") === 0) {
    cliExecute("bastille myst brutalist gesture");
  }
}

function prepFamiliars(): void {
  /* if (have($familiar`Robortender`)) {
    for (const drink of $items`Newark, drive-by shooting, Feliz Navidad, single entendre, Bloody Nora`) {
      if (get("_roboDrinks").includes(drink.name)) continue;
      useFamiliar($familiar`Robortender`);
      if (itemAmount(drink) === 0) retrieveItem(1, drink);
      print(`Feeding robortender ${drink}.`, "blue");
      visitUrl(`inventory.php?action=robooze&which=1&whichitem=${toInt(drink)}`);
    }
  } */

  if (have($item`mumming trunk`) && !get("_mummeryMods").includes("Item Drop")) {
    useFamiliar(fairyFamiliar());
    cliExecute("mummery item");
  }

  if (get("_feastUsed") === 0) {
    withStash($items`moveable feast`, () => {
      if (have($item`moveable feast`))
        [
          ...$familiars`Pocket Professor, Frumious Bandersnatch, Pair of Stomping Boots`,
          fairyFamiliar(),
        ].forEach(tryFeast);
    });
  }
}

function horse(): void {
  visitUrl("place.php?whichplace=town_right");
  if (get("horseryAvailable") && get("_horsery") !== "dark horse") {
    cliExecute("horsery dark");
  }
}

function dailyBuffs(): void {
  if (!get("_clanFortuneBuffUsed") && have($item`Clan VIP Lounge key`)) {
    withVIPClan(() => {
      if (getClanLounge()["Clan Carnival Game"] !== undefined) {
        cliExecute("fortune buff item");
      }
    });
  }

  while (SourceTerminal.have() && SourceTerminal.getEnhanceUses() < 3) {
    SourceTerminal.enhance($effect`items.enh`);
  }
}

function configureMisc(): void {
  if (SongBoom.songChangesLeft() > 0) SongBoom.setSong("Food Vibrations");
  if (SourceTerminal.have()) {
    SourceTerminal.educate([$skill`Extract`, $skill`Digitize`]);
    if (get("sourceTerminalEnquiry") !== "familiar.enq") {
      SourceTerminal.enquiry($effect`familiar.enq`);
    }
  }

  if (have($item`BittyCar MeatCar`) && get("_bittycar") !== "meatcar") {
    use(1, $item`BittyCar MeatCar`);
  }

  if (get("_VYKEACompanionLevel") === 0) {
    retrieveItem($item`VYKEA hex key`);
    cliExecute(`create level 3 lamp`);
  }

  if (
    myClass() === $class`Pastamancer` &&
    myThrall() !== $thrall`Lasagmbie` &&
    haveSkill($skill`Bind Spice Ghost`)
  ) {
    useSkill($skill`Bind Spice Ghost`);
  }

  if (
    myClass() === $class`Pastamancer` &&
    have($item`experimental carbon fiber pasta additive`) &&
    !get("_pastaAdditive") &&
    myThrall().level < 10
  ) {
    use($item`experimental carbon fiber pasta additive`);
  }

  if (!get("_olympicSwimmingPoolItemFound") && have($item`Clan VIP Lounge key`)) {
    withVIPClan(() => {
      if (getClanLounge()["Olympic-sized Clan crate"] !== undefined) {
        cliExecute("swim item");
      }
    });
  }

  if (currentMcd() < 10) changeMcd(10);
}

function volcanoDailies(): void {
  if (!(get("hotAirportAlways") || get("_hotAirportToday"))) return;
  if (!get("_volcanoItemRedeemed")) checkVolcanoQuest();

  print("Getting my free volcoino!", "blue");
  if (!get("_infernoDiscoVisited")) {
    $items`smooth velvet pocket square, smooth velvet socks, smooth velvet hat, smooth velvet shirt, smooth velvet hanky, smooth velvet pants`.forEach(
      (discoEquip) => {
        retrieveItem(discoEquip);
      }
    );
    maximize("disco style", false);
    visitUrl("place.php?whichplace=airport_hot&action=airport4_zone1");
    runChoice(7);
  }

  if (have($skill`Unaccompanied Miner`) && get("_unaccompaniedMinerUsed") < 5) {
    cliExecute(`minevolcano.ash ${5 - get("_unaccompaniedMinerUsed")}`);
  }
}
function checkVolcanoQuest() {
  print("Checking volcano quest", "blue");
  visitUrl("place.php?whichplace=airport_hot&action=airport4_questhub");
  const volcanoItems = [
    property.getItem("_volcanoItem1") || $item`none`,
    property.getItem("_volcanoItem2") || $item`none`,
    property.getItem("_volcanoItem3") || $item`none`,
  ];
  const volcanoWhatToDo: Map<Item, () => boolean> = new Map<Item, () => boolean>([
    [
      $item`New Age healing crystal`,
      () => {
        if (availableAmount($item`New Age healing crystal`) >= 5) return true;
        else {
          return (
            buy(
              5 - availableAmount($item`New Age healing crystal`),
              $item`New Age healing crystal`,
              1000
            ) ===
            5 - availableAmount($item`New Age healing crystal`)
          );
        }
      },
    ],
    [
      $item`SMOOCH bottlecap`,
      () => {
        if (availableAmount($item`SMOOCH bottlecap`) > 0) return true;
        else return buy(1, $item`SMOOCH bottlecap`, 5000) === 1;
      },
    ],
    [
      $item`gooey lava globs`,
      () => {
        if (availableAmount($item`gooey lava globs`) >= 5) {
          return true;
        } else {
          const toBuy = 5 - availableAmount($item`gooey lava globs`);
          return buy(toBuy, $item`gooey lava globs`, 5000) === toBuy;
        }
      },
    ],
    [$item`fused fuse`, () => have($item`Clara's bell`) && !get("_claraBellUsed")],
    [
      $item`smooth velvet bra`,
      () => {
        if (availableAmount($item`smooth velvet bra`) < 3) {
          cliExecute(
            `acquire ${(
              3 - availableAmount($item`smooth velvet bra`)
            ).toString()} smooth velvet bra`
          );
        }
        return availableAmount($item`smooth velvet bra`) >= 3;
      },
    ],
    [
      $item`SMOOCH bracers`,
      () => {
        if (availableAmount($item`SMOOCH bracers`) < 3) {
          cliExecute(
            `acquire ${(3 - availableAmount($item`SMOOCH bracers`)).toString()} smooch bracers`
          );
        }
        return availableAmount($item`SMOOCH bracers`) >= 3;
      },
    ],
  ]);
  for (const [volcanoItem, tryToGetIt] of volcanoWhatToDo.entries()) {
    if (volcanoItems.includes(volcanoItem)) {
      if (tryToGetIt()) {
        if (volcanoItem !== $item`fused fuse`) {
          visitUrl("place.php?whichplace=airport_hot&action=airport4_questhub");
          print(`Alright buddy, turning in ${volcanoItem.plural} for a volcoino!`, "red");
          const choice =
            volcanoItems.indexOf(volcanoItem) === -1 ? 4 : 1 + volcanoItems.indexOf(volcanoItem);
          runChoice(choice);
        }
      }
    }
  }
}

function cheat(): void {
  if (have($item`Deck of Every Card`)) {
    [
      "Island",
      "Ancestral Recall",
      saleValue($item`gift card`) >= saleValue($item`1952 Mickey Mantle card`)
        ? "Gift Card"
        : "1952 Mickey Mantle",
    ].forEach((card) => {
      if (get("_deckCardsDrawn") <= 10 && !get("_deckCardsSeen").includes(card))
        cliExecute(`cheat ${card}`);
    });
  }
}

function tomeSummons(): void {
  const tomes = $skills`Summon Snowcones, Summon Stickers, Summon Sugar Sheets, Summon Rad Libs, Summon Smithsness`;
  tomes.forEach((skill) => {
    if (have(skill) && skill.dailylimit > 0) {
      useSkill(skill, skill.dailylimit);
    }
  });

  if (have($skill`Summon Clip Art`) && $skill`Summon Clip Art`.dailylimit > 0) {
    let best = $item`none`;
    for (let itemId = 5224; itemId <= 5283; itemId++) {
      const current = Item.get(`[${itemId}]`);
      if (saleValue(current) > saleValue(best)) {
        best = current;
      }
    }
    if (best !== $item`none`) {
      cliExecute(`try; create ${$skill`Summon Clip Art`.dailylimit} ${best}`);
    }
  }
}

function gin(): void {
  if (have($item`Time-Spinner`)) {
    if (
      !get("_timeSpinnerReplicatorUsed") &&
      get("timeSpinnerMedals") >= 5 &&
      get("_timeSpinnerMinutesUsed") <= 8
    ) {
      cliExecute("FarFuture mall");
    }
  }
}

function internetMemeShop(): void {
  const baconValue = mallPrice($item`BACON`);

  const internetMemeShopProperties = {
    _internetViralVideoBought: $item`viral video`,
    _internetPlusOneBought: $item`plus one`,
    _internetGallonOfMilkBought: $item`gallon of milk`,
    _internetPrintScreenButtonBought: $item`print screen button`,
    _internetDailyDungeonMalwareBought: $item`daily dungeon malware`,
  };

  for (const [property, item] of Object.entries(internetMemeShopProperties)) {
    if (!get<boolean>(property) && baconValue * coinmasterPrice(item) < saleValue(item)) {
      retrieveItem($item`BACON`, coinmasterPrice(item));
      buy($coinmaster`Internet Meme Shop`, 1, item);
    }
  }
}

const teas = $items`cuppa Activi tea, cuppa Alacri tea, cuppa Boo tea, cuppa Chari tea, cuppa Craft tea, cuppa Cruel tea, cuppa Dexteri tea, cuppa Feroci tea, cuppa Flamibili tea, cuppa Flexibili tea, cuppa Frost tea, cuppa Gill tea, cuppa Impregnabili tea, cuppa Improprie tea, cuppa Insani tea, cuppa Irritabili tea, cuppa Loyal tea, cuppa Mana tea, cuppa Mediocri tea, cuppa Monstrosi tea, cuppa Morbidi tea, cuppa Nas tea, cuppa Net tea, cuppa Neuroplastici tea, cuppa Obscuri tea, cuppa Physicali tea, cuppa Proprie tea, cuppa Royal tea, cuppa Serendipi tea, cuppa Sobrie tea, cuppa Toast tea, cuppa Twen tea, cuppa Uncertain tea, cuppa Vitali tea, cuppa Voraci tea, cuppa Wit tea, cuppa Yet tea`;
function pickTea(): void {
  if (!getCampground()["potted tea tree"] || get("_pottedTeaTreeUsed")) return;
  const bestTea = teas.sort((a, b) => saleValue(b) - saleValue(a))[0];
  const shakeVal = 3 * saleValue(...teas);
  const teaAction = shakeVal > saleValue(bestTea) ? "shake" : bestTea.name;
  cliExecute(`teatree ${teaAction}`);
}

function gaze(): void {
  if (!get("getawayCampsiteUnlocked")) return;
  if (!get("_campAwayCloudBuffs")) visitUrl("place.php?whichplace=campaway&action=campaway_sky");
  while (get("_campAwaySmileBuffs") < 3)
    visitUrl("place.php?whichplace=campaway&action=campaway_sky");
}

function martini(): void {
  if (
    !have($item`Kremlin's Greatest Briefcase`) ||
    get("_kgbClicksUsed") > 17 ||
    get("_kgbDispenserUses") >= 3
  ) {
    return;
  }
  cliExecute("Briefcase collect");
}

function chateauDesk(): void {
  if (ChateauMantegna.have() && !get("_chateauDeskHarvested")) {
    visitUrl("place.php?whichplace=chateau&action=chateau_desk2", false);
  }
}
