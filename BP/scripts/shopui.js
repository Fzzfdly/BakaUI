import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { world, system, ItemStack } from '@minecraft/server'
export { Shop };
import { Menu } from "./index";

const itemBlock = [{
  textures: 'textures/aulonia_icons/icontextures/block_row_1_column_3.png',
  name: 'Grass',
  cost: 2,
  sell: 1,
  data: 0,
  item: 'grass'
},
{
  textures: 'textures/aulonia_icons/icontextures/block_row_1_column_1.png',
  name: 'Dirt',
  cost: 1,
  sell: 1,
  data: 0,
  item: 'dirt',
},
{
  textures: 'textures/aulonia_icons/icontextures/block_row_1_column_8.png',
  name: 'Sand',
  cost: 3,
  sell: 1,
  data: 0,
  item: 'sand',
},
{
  textures: 'textures/aulonia_icons/icontextures/block_row_1_column_9.png',
  name: 'Red sand',
  cost: 5,
  sell: 1,
  data: 1,
  item: 'sand',
},
{
  textures: 'textures/aulonia_icons/icontextures/block_row_1_column_7.png',
  name: 'Gravel',
  cost: 3,
  sell: 1,
  data: 0,
  item: 'gravel',
},
{
  textures: 'textures/aulonia_icons/icontextures/block_row_1_column_10.png',
  name: 'Clay',
  cost: 5,
  sell: 1,
  data: 0,
  item: 'clay',
},
{
  textures: 'textures/aulonia_icons/icontextures/block_row_1_column_12.png',
  name: 'Cobblestone',
  cost: 2,
  sell: 1,
  data: 0,
  item: 'cobblestone',
},
{
  textures: 'textures/aulonia_icons/icontextures/block_row_1_column_11.png',
  name: 'Stone',
  cost: 6,
  sell: 2,
  data: 0,
  item: 'stone',
},
{
  textures: 'textures/aulonia_icons/icontextures/block_row_1_column_14.png',
  name: 'Granite',
  cost: 5,
  sell: 2,
  data: 1,
  item: 'stone',
},
{
  textures: 'textures/aulonia_icons/icontextures/block_row_1_column_17.png',
  name: 'Diorite',
  cost: 5,
  sell: 2,
  data: 3,
  item: 'stone',
},
{
  textures: 'textures/aulonia_icons/icontextures/block_row_2_column_2.png',
  name: 'Andesite',
  cost: 5,
  sell: 2,
  data: 5,
  item: 'stone',
},
{
  textures: 'textures/aulonia_icons/icontextures/block_row_3_column_5.png',
  name: 'Prismarine',
  cost: 20,
  sell: 10,
  data: 0,
  item: 'prismarine',
},
{
  textures: 'textures/aulonia_icons/icontextures/block_row_3_column_6.png',
  name: 'Prismarine Bricks',
  cost: 20,
  sell: 10,
  data: 2,
  item: 'prismarine',
},
{
  textures: 'textures/aulonia_icons/icontextures/block_row_3_column_7.png',
  name: 'Dark Prismarine',
  cost: 20,
  sell: 10,
  data: 1,
  item: 'prismarine',
},
{
  textures: 'textures/aulonia_icons/icontextures/block_row_2_column_10.png',
  name: 'End Stone',
  cost: 10,
  sell: 3,
  data: 0,
  item: 'end_stone',
},
];

//SHOP FARMING
const ItemFarm = [{
  textures: 'textures/items/seeds_pumpkin.png',
  name: 'Pumpkin Seeds',
  cost: 15,
  sell: 2,
  data: 0,
  item: 'pumpkin_seeds'
},
{
  textures: 'textures/aulonia_icons/icontextures/wheat_seeds.png',
  name: 'Seeds',
  cost: 5,
  sell: 1,
  data: 0,
  item: 'wheat_seeds'
},
{
  textures: 'textures/items/seeds_melon.png',
  name: 'Melon seeds',
  cost: 15,
  sell: 1,
  data: 0,
  item: 'melon_seeds'
},
{
  textures: 'textures/items/seeds_beetroot.png',
  name: 'Beetroot seeds',
  cost: 15,
  sell: 2,
  data: 0,
  item: 'beetroot_seeds'
},
{
  textures: 'textures/aulonia_icons/icontextures/wheat.png',
  name: 'Wheat',
  cost: 30,
  sell: 11,
  data: 0,
  item: 'wheat'
},
{
  textures: 'textures/aulonia_icons/icontextures/beetroot.png',
  name: 'Beetroot',
  cost: 25,
  sell: 11,
  data: 0,
  item: 'beetroot'
},
{
  textures: 'textures/aulonia_icons/icontextures/carrot.png',
  name: 'Carrot',
  cost: 25,
  sell: 11,
  data: 0,
  item: 'carrot'
},
{
  textures: 'textures/aulonia_icons/icontextures/potato.png',
  name: 'Potato',
  cost: 25,
  sell: 10,
  data: 0,
  item: 'potato'
},
{
  textures: 'textures/aulonia_icons/icontextures/melon_slice.png',
  name: 'Melon Slice',
  cost: 10,
  sell: 2,
  data: 0,
  item: 'melon_slice'
},
{
  textures: 'textures/aulonia_icons/icontextures/sugar_cane.png',
  name: 'Sugar Cane',
  cost: 10,
  sell: 8,
  data: 0,
  item: 'sugar_cane'
}
];

//SHOP ORES
const ItemOres = [{
  textures: 'textures/aulonia_icons/icontextures/coal.png',
  name: 'Coal',
  cost: 25,
  sell: 5,
  data: 0,
  item: 'coal'
},
{
  textures: 'textures/aulonia_icons/icontextures/copper_ingot.png',
  name: 'Copper ingot',
  cost: 44,
  sell: 9,
  data: 0,
  item: 'copper_ingot'
},
{
  textures: 'textures/aulonia_icons/icontextures/iron_ingot.png',
  name: 'Iron ingot',
  cost: 85,
  sell: 20,
  data: 0,
  item: 'iron_ingot'
},
{
  textures: 'textures/aulonia_icons/icontextures/gold_ingot.png',
  name: 'Gold ingot',
  cost: 70,
  sell: 18,
  data: 0,
  item: 'gold_ingot'
},
{
  textures: 'textures/aulonia_icons/icontextures/redstone.png',
  name: 'Redstone',
  cost: 24,
  sell: 6,
  data: 0,
  item: 'redstone'
},
{
  textures: 'textures/aulonia_icons/icontextures/lapis_lazuli.png',
  name: 'Lapis Lazuli',
  cost: 30,
  sell: 8,
  data: 0,
  item: 'lapis_lazuli'
},
{
  textures: 'textures/aulonia_icons/icontextures/emerald.png',
  name: 'Emerald',
  cost: 79,
  sell: 25,
  data: 0,
  item: 'emerald'
},
{
  textures: 'textures/aulonia_icons/icontextures/diamond.png',
  name: 'Diamond',
  cost: 340,
  sell: 250,
  data: 0,
  item: 'diamond'
}
];

//SHOP Mob Drops
const ItemMobdrops = [{
  textures: 'textures/items/rotten_flesh.png',
  name: 'Rotten Flesh',
  cost: 14,
  sell: 2,
  data: 0,
  item: 'rotten_flesh'
},
{
  textures: 'textures/aulonia_icons/icontextures/bone.png',
  name: 'Bone',
  cost: 20,
  sell: 5,
  data: 0,
  item: 'bone'
},
{
  textures: 'textures/aulonia_icons/icontextures/feather.png',
  name: 'Feather',
  cost: 10,
  sell: 1,
  data: 0,
  item: 'feather'
},
{
  textures: 'textures/aulonia_icons/icontextures/slime_ball.png',
  name: 'Slime Ball',
  cost: 100,
  sell: 8,
  data: 0,
  item: 'slime_ball'
},
{
  textures: 'textures/aulonia_icons/icontextures/blaze_rod.png',
  name: 'Blaze Rod',
  cost: 200,
  sell: 100,
  data: 0,
  item: 'blaze_rod'
}
];

//SHOP Miscellaneous
const ItemMiscellaneous = [{
  textures: 'textures/items/paper.png',
  name: 'Clan Ticket',
  cost: 7000,
  sell: 5000,
  data: 0,
  item: 'candra:ticket_clan'
},
{
  textures: 'textures/aulonia_icons/icontextures/block_row_15_column_11',
  name: 'Shulker Box',
  cost: 10000,
  sell: 6900,
  data: 0,
  item: 'orange_shulker_box'
},
{
  textures: 'textures/items/egg_villager.png',
  name: 'Vilager',
  cost: 8000,
  sell: 6500,
  data: 0,
  item: 'villager_spawn_egg'
},
{
  textures: 'textures/aulonia_icons/icontextures/compass_00.png',
  name: 'Compass',
  cost: 100,
  sell: 50,
  data: 0,
  item: 'compass'
}
];

function rec(player, objective, min, max) {
  if (min == max) { return min }
  const middle = min + Math.floor((max - min) / 2)
  const p1 = world.getPlayers({ name: player.name, scoreOptions: [{ objective: objective, minScore: min, maxScore: middle }] })
  if (p1.length === 1) { return rec(player, objective, min, middle) }
  else { return rec(player, objective, middle + 1, max) }
}
function getScore(player, objective) {
  const p1 = world.getPlayers({ name: player.name, scoreOptions: [{ objective: objective, minScore: -2147483648, maxScore: 2147483647 }] })
  if (p1.length === 0) { return 0 }
  return rec(player, objective, -2147483648, 2147483647)
}



function Shop(player) {
  let form = new ActionFormData();
  const score = getScore(player, "money");
  form.title("§l Marketplace ")
  form.body(`§l»  Welcome to The Marketplace!\nYou have : §r§f${score} `)
  form.button('Blocks', 'textures/aulonia_icons/icontextures/block_row_2_column_5.png')
  form.button('Crops', 'textures/aulonia_icons/icontextures/tile500.png')
  form.button('Ores', 'textures/aulonia_icons/icontextures/tile447.png')
  form.button('Mob Drops', 'textures/items/rotten_flesh.png')
  form.button('Miscellaneous', 'textures/items/paper.png')
  form.button("Exit", "textures/aulonia_icons/2.png")
  form.show(player).then(result => {
    if (result.canceled) {
      return;
    }
    if (result.selection === 0) {
      Block(player);
    }
    if (result.selection === 1) {
      Farm(player);
    }
    if (result.selection === 2) {
      Ores(player);
    }
    if (result.selection === 3) {
      Mobdrops(player);
    }
    if (result.selection === 4) {
      Miscellaneous(player);
    }
    if (result.selection === 5) {
      Menu(player);
    }
  })
}

function Block(player) {
  const gui = new ActionFormData();
  const score = getScore(player, "money");
  gui.title(`§lMarketplace `);
  for (const item of itemBlock)
    gui.button(`${item.name}\n§r§aPrice : $${item.cost}§r || §cSell : $${item.sell}`,
      `${item.textures}`);
  gui.show(player).then(result => {
    if (result.isCanceled)
      return;
    const item = itemBlock[result.selection];
    var money = getScore(player, "money")
    let form = new ModalFormData()
    form.title(`§l§6 Marketplace `)
    form.slider(`§7- §eYou have ${money} \n» §6Buy x1 §e${item.name} = §e${item.cost} \l» §6Sell x1 §e${item.name} = $${item.sell} \n\n » §6Amount`, 1, 64, 1)
    form.toggle('§cSell §f/§a Buy', false);
    form.show(player).then(result => {
      let dataCost = item.cost * result.formValues[0];
      let dataSell = item.sell * result.formValues[0];
      if (result.formValues[1] == false) {
        //conditions for selling done with logic in execute commands
        player.runCommand(`execute if entity @s[hasitem={item=${item.item},quantity=!${result.formValues[0]}..,data=${item.data}}] run tellraw @s {"rawtext":[{"text":"§r§e» §cInsufficient item(s)!"}]}`)
        player.runCommand(`execute if entity @s[hasitem={item=${item.item},quantity=${result.formValues[0]}..,data=${item.data}}] run scoreboard players add @s money ${dataSell}`)
        player.runCommand(`execute if entity @s[hasitem={item=${item.item},quantity=${result.formValues[0]}..,data=${item.data}}] run tellraw @s {"rawtext":[{"text":"§r§e» §6You sold §fx${result.formValues[0]} ${item.name} §6for §a§l$${dataSell}"}]}`)
        player.runCommand(`execute if entity @s[hasitem={item=${item.item},quantity=${result.formValues[0]}..,data=${item.data}}] run clear @s ${item.item} ${item.data} ${result.formValues[0]}`)
      }
      if (result.formValues[1] == true) {
        //conditions for buying done with logic in execute commands
        player.runCommand(`execute if entity @s[scores={money=!${dataCost}..}] run tellraw @s {"rawtext":[{"text":"§r§e» §cYou're too poor'!"}]}`)
        player.runCommand(`execute if entity @s[scores={money=${dataCost}..}] run gamerule sendcommandfeedback false`)
        player.runCommand(`execute if entity @s[scores={money=${dataCost}..}] run give @s ${item.item} ${result.formValues[0]} ${item.data}`)

        player.runCommand(`execute if entity @s[scores={money=${dataCost}..}] run tellraw @s {"rawtext":[{"text":"§r§e» §6You bought §fx${result.formValues[0]} ${item.name} §6for §a§l$${dataCost}"}]}`)
        player.runCommand(`execute if entity @s[scores={money=${dataCost}..}] run scoreboard players remove @s money ${dataCost}`)
      }
    })
  });
};

function Farm(player) {
  const gui = new ActionFormData();
  const score = getScore(player, "money");
  gui.title(`§lMarketplace `);
  for (const item of ItemFarm)
    gui.button(`${item.name}\n§r§aPrice : §f$${item.cost}§r | §cSell : §f$${item.sell}`,
      `${item.textures}`);
  gui.show(player).then(result => {
    if (result.isCanceled)
      return;
    const item = ItemFarm[result.selection];
    var money = getScore(player, "money")
    let form = new ModalFormData()
    form.title(`§lMarketplace `)
    form.slider(`§7- §eYou have §f${money} \n§l» §6Buy x1 §6§e${item.name} §6= §e${item.cost} \n§l» §6Sell x1 §6§e${item.name} §6= §e$${item.sell} \n\n§l » §6Amount`, 1, 64, 1)
    form.toggle('§cSell §f/§a Buy', false);
    form.show(player).then(result => {
      let dataCost = item.cost * result.formValues[0];
      let dataSell = item.sell * result.formValues[0];
      if (result.formValues[1] == false) {
        //conditions for selling done with logic in execute commands
        player.runCommand(`execute if entity @s[hasitem={item=${item.item},quantity=!${result.formValues[0]}..,data=${item.data}}] run tellraw @s {"rawtext":[{"text":"§r§e» §cInsufficient item(s)!"}]}`)
        player.runCommand(`execute if entity @s[hasitem={item=${item.item},quantity=${result.formValues[0]}..,data=${item.data}}] run scoreboard players add @s money ${dataSell}`)
        player.runCommand(`execute if entity @s[hasitem={item=${item.item},quantity=${result.formValues[0]}..,data=${item.data}}] run tellraw @s {"rawtext":[{"text":"§r§e» §6You sold §fx${result.formValues[0]} ${item.name} §6for §a§l$${dataSell}"}]}`)
        player.runCommand(`execute if entity @s[hasitem={item=${item.item},quantity=${result.formValues[0]}..,data=${item.data}}] run clear @s ${item.item} ${item.data} ${result.formValues[0]}`)
      }
      if (result.formValues[1] == true) {
        //conditions for buying done with logic in execute commands
        player.runCommand(`execute if entity @s[scores={money=!${dataCost}..}] run tellraw @s {"rawtext":[{"text":"§r§e» §cYou're too poor'!"}]}`)
        player.runCommand(`execute if entity @s[scores={money=${dataCost}..}] run gamerule sendcommandfeedback false`)
        player.runCommand(`execute if entity @s[scores={money=${dataCost}..}] run give @s ${item.item} ${result.formValues[0]} ${item.data}`)

        player.runCommand(`execute if entity @s[scores={money=${dataCost}..}] run tellraw @s {"rawtext":[{"text":"§r§e» §6You bought §fx${result.formValues[0]} ${item.name} §6for §a§l$${dataCost}"}]}`)
        player.runCommand(`execute if entity @s[scores={money=${dataCost}..}] run scoreboard players remove @s money ${dataCost}`)
      }
    })
  });
};

function Ores(player) {
  const gui = new ActionFormData();
  const score = getScore(player, "money");
  gui.title(`§lMarketplace `);
  for (const item of ItemOres)
    gui.button(`${item.name}\n§r§aPrice : §f$${item.cost}§r | §cSell : §f$${item.sell}`,
      `${item.textures}`);
  gui.show(player).then(result => {
    if (result.isCanceled)
      return;
    const item = ItemOres[result.selection];
    var money = getScore(player, "money")
    let form = new ModalFormData()
    form.title(`§lMarketplace `)
    form.slider(`§7- §eYou have §f${money} \n§l» §6Buy x1 §6§e${item.name} §6= §e${item.cost} \n§l» §6Sell x1 §6§e${item.name} §6= §e$${item.sell} \n\n§l » §6Amount`, 1, 64, 1)
    form.toggle('§cSell §f/§a Buy', false);
    form.show(player).then(result => {
      let dataCost = item.cost * result.formValues[0];
      let dataSell = item.sell * result.formValues[0];
      if (result.formValues[1] == false) {
        //conditions for selling done with logic in execute commands
        player.runCommand(`execute if entity @s[hasitem={item=${item.item},quantity=!${result.formValues[0]}..,data=${item.data}}] run tellraw @s {"rawtext":[{"text":"§r§e» §cInsufficient item(s)!"}]}`)
        player.runCommand(`execute if entity @s[hasitem={item=${item.item},quantity=${result.formValues[0]}..,data=${item.data}}] run scoreboard players add @s money ${dataSell}`)
        player.runCommand(`execute if entity @s[hasitem={item=${item.item},quantity=${result.formValues[0]}..,data=${item.data}}] run tellraw @s {"rawtext":[{"text":"§r§e» §6You sold §fx${result.formValues[0]} ${item.name} §6for §a§l$${dataSell}"}]}`)
        player.runCommand(`execute if entity @s[hasitem={item=${item.item},quantity=${result.formValues[0]}..,data=${item.data}}] run clear @s ${item.item} ${item.data} ${result.formValues[0]}`)
      }
      if (result.formValues[1] == true) {
        //conditions for buying done with logic in execute commands
        player.runCommand(`execute if entity @s[scores={money=!${dataCost}..}] run tellraw @s {"rawtext":[{"text":"§r§e» §cYou're too poor'!"}]}`)
        player.runCommand(`execute if entity @s[scores={money=${dataCost}..}] run gamerule sendcommandfeedback false`)
        player.runCommand(`execute if entity @s[scores={money=${dataCost}..}] run give @s ${item.item} ${result.formValues[0]} ${item.data}`)

        player.runCommand(`execute if entity @s[scores={money=${dataCost}..}] run tellraw @s {"rawtext":[{"text":"§r§e» §6You bought §fx${result.formValues[0]} ${item.name} §6for §a§l$${dataCost}"}]}`)
        player.runCommand(`execute if entity @s[scores={money=${dataCost}..}] run scoreboard players remove @s money ${dataCost}`)
      }
    })
  });
};

function Mobdrops(player) {
  const gui = new ActionFormData();
  const score = getScore(player, "money");
  gui.title(`§lMarketplace `);
  for (const item of ItemMobdrops)
    gui.button(`${item.name}\n§r§aPrice : §f$${item.cost}§r | §cSell : §f$${item.sell}`,
      `${item.textures}`);
  gui.show(player).then(result => {
    if (result.isCanceled)
      return;
    const item = ItemMobdrops[result.selection];
    var money = getScore(player, "money")
    let form = new ModalFormData()
    form.title(`§lMarketplace `)
    form.slider(`§7- §eYou have §f${money} \n§l» §6Buy x1 §6§e${item.name} §6= §e${item.cost} \n§l» §6Sell x1 §6§e${item.name} §6= §e$${item.sell} \n\n§l » §6Amount`, 1, 64, 1)
    form.toggle('§cSell §f/§a Buy', false);
    form.show(player).then(result => {
      let dataCost = item.cost * result.formValues[0];
      let dataSell = item.sell * result.formValues[0];
      if (result.formValues[1] == false) {
        //conditions for selling done with logic in execute commands
        player.runCommand(`execute if entity @s[hasitem={item=${item.item},quantity=!${result.formValues[0]}..,data=${item.data}}] run tellraw @s {"rawtext":[{"text":"§r§e» §cInsufficient item(s)!"}]}`)
        player.runCommand(`execute if entity @s[hasitem={item=${item.item},quantity=${result.formValues[0]}..,data=${item.data}}] run scoreboard players add @s money ${dataSell}`)
        player.runCommand(`execute if entity @s[hasitem={item=${item.item},quantity=${result.formValues[0]}..,data=${item.data}}] run tellraw @s {"rawtext":[{"text":"§r§e» §6You sold §fx${result.formValues[0]} ${item.name} §6for §a§l$${dataSell}"}]}`)
        player.runCommand(`execute if entity @s[hasitem={item=${item.item},quantity=${result.formValues[0]}..,data=${item.data}}] run clear @s ${item.item} ${item.data} ${result.formValues[0]}`)
      }
      if (result.formValues[1] == true) {
        //conditions for buying done with logic in execute commands
        player.runCommand(`execute if entity @s[scores={money=!${dataCost}..}] run tellraw @s {"rawtext":[{"text":"§r§e» §cYou're too poor'!"}]}`)
        player.runCommand(`execute if entity @s[scores={money=${dataCost}..}] run gamerule sendcommandfeedback false`)
        player.runCommand(`execute if entity @s[scores={money=${dataCost}..}] run give @s ${item.item} ${result.formValues[0]} ${item.data}`)

        player.runCommand(`execute if entity @s[scores={money=${dataCost}..}] run tellraw @s {"rawtext":[{"text":"§r§e» §6You bought §fx${result.formValues[0]} ${item.name} §6for §a§l$${dataCost}"}]}`)
        player.runCommand(`execute if entity @s[scores={money=${dataCost}..}] run scoreboard players remove @s money ${dataCost}`)
      }
    })
  });
};

function Miscellaneous(player) {
  const gui = new ActionFormData();
  const score = getScore(player, "money");
  gui.title(`§lMarketplace `);
  for (const item of ItemMiscellaneous)
    gui.button(`${item.name}\n§r§aPrice : §f$${item.cost}§r | §cSell : §f$${item.sell}`,
      `${item.textures}`);
  gui.show(player).then(result => {
    if (result.isCanceled)
      return;
    const item = ItemMiscellaneous[result.selection];
    var money = getScore(player, "money")
    let form = new ModalFormData()
    form.title(`§lMarketplace `)
    form.slider(`§7- §eYou have §f${money} \n§l» §6Buy x1 §6§e${item.name} §6= §e${item.cost} \n§l» §6Sell x1 §6§e${item.name} §6= §e$${item.sell} \n\n§l » §6Amount`, 1, 64, 1)
    form.toggle('§cSell §f/§a Buy', false);
    form.show(player).then(result => {
      let dataCost = item.cost * result.formValues[0];
      let dataSell = item.sell * result.formValues[0];
      if (result.formValues[1] == false) {
        //conditions for selling done with logic in execute commands
        player.runCommand(`execute if entity @s[hasitem={item=${item.item},quantity=!${result.formValues[0]}..,data=${item.data}}] run tellraw @s {"rawtext":[{"text":"§r§e» §cInsufficient item(s)!"}]}`)
        player.runCommand(`execute if entity @s[hasitem={item=${item.item},quantity=${result.formValues[0]}..,data=${item.data}}] run scoreboard players add @s money ${dataSell}`)
        player.runCommand(`execute if entity @s[hasitem={item=${item.item},quantity=${result.formValues[0]}..,data=${item.data}}] run tellraw @s {"rawtext":[{"text":"§r§e» §6You sold §fx${result.formValues[0]} ${item.name} §6for §a§l$${dataSell}"}]}`)
        player.runCommand(`execute if entity @s[hasitem={item=${item.item},quantity=${result.formValues[0]}..,data=${item.data}}] run clear @s ${item.item} ${item.data} ${result.formValues[0]}`)
      }
      if (result.formValues[1] == true) {
        //conditions for buying done with logic in execute commands
        player.runCommand(`execute if entity @s[scores={money=!${dataCost}..}] run tellraw @s {"rawtext":[{"text":"§r§e» §cYou're too poor'!"}]}`)
        player.runCommand(`execute if entity @s[scores={money=${dataCost}..}] run gamerule sendcommandfeedback false`)
        player.runCommand(`execute if entity @s[scores={money=${dataCost}..}] run give @s ${item.item} ${result.formValues[0]} ${item.data}`)

        player.runCommand(`execute if entity @s[scores={money=${dataCost}..}] run tellraw @s {"rawtext":[{"text":"§r§e» §6You bought §fx${result.formValues[0]} ${item.name} §6for §a§l$${dataCost}"}]}`)
        player.runCommand(`execute if entity @s[scores={money=${dataCost}..}] run scoreboard players remove @s money ${dataCost}`)
      }
    })
  });
};

