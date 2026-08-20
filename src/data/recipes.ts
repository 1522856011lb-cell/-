export interface RecipeIngredientItem {
  name: string;
  amount: string;
  notes?: string;
  in_fridge?: boolean;
}

export interface RecipeStepItem {
  step_number?: number;
  title?: string;
  instruction?: string;
  detail?: string;
  image_keyword?: string;
  image_url?: string;
}

export interface RecipeData {
  id: string;
  dish_name: string;
  category: string;
  cooking_time_min: number;
  prep_time_min?: number;
  difficulty: "极速快手" | "简单家常" | "新手友好" | "中等难度";
  servings?: number;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  ingredients: RecipeIngredientItem[];
  steps: string[] | RecipeStepItem[];
  tips: string;
  image_url?: string;
  image_keyword?: string;
  created_at?: string;
}

export const AUTHENTIC_RECIPES: RecipeData[] = [
  // 1. 番茄炒蛋
  {
    id: "recipe_tomato_egg",
    dish_name: "番茄炒蛋",
    category: "经典家常菜",
    cooking_time_min: 10,
    prep_time_min: 3,
    difficulty: "极速快手",
    calories: 235,
    protein_g: 14.5,
    carbs_g: 12.0,
    fat_g: 13.5,
    fiber_g: 2.8,
    ingredients: [
      { name: "熟透番茄", amount: "2个 (约300g)" },
      { name: "新鲜鸡蛋", amount: "3个" },
      { name: "香葱", amount: "1根" },
      { name: "食用油", amount: "8ml" },
      { name: "食盐", amount: "2g" },
      { name: "白糖/代糖", amount: "3g" },
    ],
    steps: [
      "番茄洗净切小块，鸡蛋打入碗中加少许盐和半勺清水打散起泡。",
      "热锅下5ml油，油热倒入蛋液，快速用筷子或锅铲划散凝固成块，盛出备用。",
      "锅底补3ml油，下葱白爆香，倒入番茄块大火翻炒，加入盐和少许白糖炒出浓郁红亮汤汁。",
      "倒入之前炒好的鸡蛋块，翻炒让鸡蛋充分吸饱番茄浓汁，撒上葱花即可出锅。"
    ],
    tips: "打蛋液时加半勺清水可以让炒出来的鸡蛋更加蓬松滑嫩；先加盐炒番茄更容易出浓汁。",
    image_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
  },

  // 2. 青椒肉丝
  {
    id: "recipe_shredded_pork_pepper",
    dish_name: "青椒肉丝",
    category: "经典家常菜",
    cooking_time_min: 10,
    prep_time_min: 8,
    difficulty: "简单家常",
    calories: 285,
    protein_g: 24.5,
    carbs_g: 8.5,
    fat_g: 16.0,
    fiber_g: 3.2,
    ingredients: [
      { name: "里脊猪肉", amount: "180g" },
      { name: "薄皮青椒", amount: "3个" },
      { name: "生抽", amount: "10ml" },
      { name: "料酒", amount: "5ml" },
      { name: "玉米淀粉", amount: "5g" },
      { name: "大蒜", amount: "2瓣" },
      { name: "植物油", amount: "8ml" },
    ],
    steps: [
      "里脊肉顺纹切成细丝，加入生抽、料酒、淀粉和少许油抓匀腌制10分钟锁水。",
      "青椒去籽去蒂切细丝，大蒜切片备用。",
      "热锅冷油，下肉丝快速滑炒至变色发白（约8成熟）迅速盛出。",
      "锅留底油爆香蒜片，倒入青椒丝大火快炒断生，调入少许盐。",
      "倒入滑好的肉丝大火翻炒均匀，淋入几滴生抽提鲜即可出锅。"
    ],
    tips: "肉丝加淀粉和少许食用油抓匀腌制是肉质嫩滑不发柴的关键；青椒大火快炒保持爽脆碧绿。",
    image_url: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80",
  },

  // 3. 麻婆豆腐
  {
    id: "recipe_mapo_tofu",
    dish_name: "麻婆豆腐",
    category: "经典川味",
    cooking_time_min: 15,
    prep_time_min: 5,
    difficulty: "简单家常",
    calories: 220,
    protein_g: 16.8,
    carbs_g: 9.0,
    fat_g: 12.5,
    fiber_g: 2.5,
    ingredients: [
      { name: "嫩豆腐/南豆腐", amount: "1块 (约350g)" },
      { name: "瘦肉末/牛肉末", amount: "60g" },
      { name: "豆瓣酱", amount: "15g" },
      { name: "花椒粉", amount: "2g" },
      { name: "生抽", amount: "8ml" },
      { name: "水淀粉", amount: "20ml" },
      { name: "小葱", amount: "2根" },
    ],
    steps: [
      "豆腐切成2cm小方块，放入加了少许盐的沸水中焯水1分钟捞出沥干（防碎除豆腥）。",
      "热锅下底油，下肉末小火煸炒至酥香发白。",
      "加入郫县豆瓣酱炒出红油和酱香，倒入半碗清水或高汤，加入生抽煮沸。",
      "下入焯好水的豆腐块，转中小火慢煨3-4分钟让豆腐入味。",
      "分两次淋入水淀粉勾薄芡，晃动锅底让汤汁浓稠裹匀豆腐，出锅撒上现磨花椒粉与葱花。"
    ],
    tips: "豆腐先用淡盐水焯烫不仅能去除豆腥味，还能让豆腐紧致不易碎；分次勾芡汤汁更红亮挂汁。",
    image_url: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80",
  },

  // 4. 清炒西兰花
  {
    id: "recipe_stir_fried_broccoli",
    dish_name: "清炒西兰花",
    category: "刮油蔬菜",
    cooking_time_min: 8,
    prep_time_min: 4,
    difficulty: "极速快手",
    calories: 95,
    protein_g: 6.8,
    carbs_g: 9.5,
    fat_g: 3.5,
    fiber_g: 5.2,
    ingredients: [
      { name: "新鲜西兰花", amount: "300g" },
      { name: "大蒜", amount: "4瓣 (切蒜末)" },
      { name: "食盐", amount: "2g" },
      { name: "橄榄油/植物油", amount: "5ml" },
      { name: "蚝油", amount: "5ml" },
    ],
    steps: [
      "西兰花切小朵，淡盐水中浸泡5分钟洗净杂质。",
      "锅中水烧开，加两滴油和少许盐，放入西兰花焯水45秒捞出过凉水控干。",
      "锅中倒入5ml油烧热，下入蒜末小火爆出浓郁蒜香。",
      "倒入控干水分的西兰花大火快速翻炒半分钟。",
      "加入少许盐和蚝油调味，翻炒均匀即可装盘。"
    ],
    tips: "焯水时加盐和油能让西兰花保持翠绿油亮，焯水45秒后过凉水口感最爽脆营养不流失。",
    image_url: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=800&q=80",
  },

  // 5. 白灼虾
  {
    id: "recipe_boiled_prawns",
    dish_name: "白灼虾",
    category: "高蛋白海鲜",
    cooking_time_min: 6,
    prep_time_min: 3,
    difficulty: "极速快手",
    calories: 145,
    protein_g: 27.5,
    carbs_g: 1.2,
    fat_g: 1.8,
    fiber_g: 0.0,
    ingredients: [
      { name: "鲜活基围虾/对虾", amount: "250g" },
      { name: "生姜", amount: "4片" },
      { name: "香葱", amount: "2根 (挽结)" },
      { name: "料酒", amount: "15ml" },
      { name: "白灼汁/生抽香油蘸料", amount: "15ml" },
    ],
    steps: [
      "鲜虾洗净，剪去虾须虾枪，用牙签挑出虾线备用。",
      "锅内加入足量清水，放入姜片、葱结和料酒大火烧沸。",
      "水大滚后下入鲜虾，保持大火煮至虾身弯曲变红（约1.5-2分钟）。",
      "迅速用漏勺捞出沥干装盘，搭配生抽、香油、姜末调成的蘸料享用。"
    ],
    tips: "白灼虾一定要水大沸腾后再下虾，煮至虾身变成U型弯曲即可捞出，肉质最紧致弹牙。",
    image_url: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80",
  },

  // 6. 紫菜蛋花汤
  {
    id: "recipe_seaweed_egg_soup",
    dish_name: "紫菜蛋花汤",
    category: "快手靓汤",
    cooking_time_min: 5,
    prep_time_min: 2,
    difficulty: "极速快手",
    calories: 78,
    protein_g: 6.8,
    carbs_g: 3.2,
    fat_g: 4.2,
    fiber_g: 1.5,
    ingredients: [
      { name: "免洗优质紫菜", amount: "10g" },
      { name: "新鲜鸡蛋", amount: "1-2个" },
      { name: "香葱", amount: "1根" },
      { name: "白胡椒粉", amount: "1g" },
      { name: "芝麻香油", amount: "2ml" },
      { name: "食盐", amount: "2g" },
    ],
    steps: [
      "大碗中预先放入紫菜、虾皮（可选）、葱花、白胡椒粉、盐和几滴芝麻香油。",
      "鸡蛋打入碗中彻底搅打均匀呈细腻蛋液。",
      "锅内烧开两碗清水，水开后关小火或关火，将蛋液从高处以细流绕圈淋入锅中。",
      "静置数秒待蛋花浮起成漂亮薄片，开火煮沸5秒即关火。",
      "将热汤直接冲入放有紫菜的大碗中，激发出紫菜与香油的鲜美香气即可。"
    ],
    tips: "水开后关小火淋蛋液并逆时针搅动，能形成薄如蝉翼的丝滑大片蛋花，汤清鲜美。",
    image_url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
  },

  // 7. 凉拌黄瓜
  {
    id: "recipe_cucumber_salad",
    dish_name: "凉拌黄瓜",
    category: "刮油凉拌菜",
    cooking_time_min: 5,
    prep_time_min: 3,
    difficulty: "极速快手",
    calories: 65,
    protein_g: 2.2,
    carbs_g: 6.8,
    fat_g: 2.5,
    fiber_g: 2.0,
    ingredients: [
      { name: "新鲜旱黄瓜/水黄瓜", amount: "2根 (约300g)" },
      { name: "大蒜", amount: "3瓣 (压蒜泥)" },
      { name: "生抽", amount: "10ml" },
      { name: "香醋/陈醋", amount: "10ml" },
      { name: "芝麻香油", amount: "3ml" },
      { name: "食盐", amount: "1.5g" },
      { name: "小米辣", amount: "1个 (可选)" },
    ],
    steps: [
      "黄瓜洗净，用刀背重重拍裂，斜刀切成适口小块放入大碗中。",
      "加入1g食盐抓拌均匀腌制3分钟，倒掉析出的部分涩水。",
      "加入蒜泥、生抽、香醋、少许白糖/代糖提鲜、香油和小米辣圈。",
      "充分抓拌均匀，冷藏5分钟后食用更加爽脆解腻。"
    ],
    tips: "黄瓜拍碎比切出来的横截面更粗糙，能吸附更多料汁，口感更入味脆爽。",
    image_url: "https://images.unsplash.com/photo-1607301406259-dfb186e15de8?auto=format&fit=crop&w=800&q=80",
  },

  // 8. 蒸红薯
  {
    id: "recipe_steamed_sweet_potato",
    dish_name: "蒸红薯",
    category: "优质主食",
    cooking_time_min: 20,
    prep_time_min: 2,
    difficulty: "新手友好",
    calories: 180,
    protein_g: 2.5,
    carbs_g: 42.0,
    fat_g: 0.3,
    fiber_g: 4.8,
    ingredients: [
      { name: "优质蜜薯/红薯", amount: "2个 (约250g)" },
      { name: "清水", amount: "适量 (蒸锅用)" },
    ],
    steps: [
      "红薯用清水彻底刷洗干净外皮，切去两端多余根须。",
      "蒸锅加水大火烧开，将红薯摆放在蒸屉上。",
      "盖上锅盖大火蒸18-20分钟（较粗的红薯可对半切开缩短时间）。",
      "用筷子能轻松穿透最粗部分即代表熟透，关火焖2分钟即可享用。"
    ],
    tips: "水开后再上锅蒸能锁住红薯的水分与糖分，口感更加软糯香甜，GI值适中高饱腹。",
    image_url: "https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?auto=format&fit=crop&w=800&q=80",
  },

  // 9. 水煮蛋
  {
    id: "recipe_boiled_egg",
    dish_name: "水煮蛋",
    category: "优质蛋白",
    cooking_time_min: 8,
    prep_time_min: 1,
    difficulty: "极速快手",
    calories: 140,
    protein_g: 12.8,
    carbs_g: 1.0,
    fat_g: 9.6,
    fiber_g: 0.0,
    ingredients: [
      { name: "新鲜鸡蛋", amount: "2个" },
      { name: "白醋/食盐", amount: "少许" },
    ],
    steps: [
      "鸡蛋洗净，锅中加入冷水没过鸡蛋，加入少许盐和白醋（防破壳易剥皮）。",
      "大火将水烧开，水沸后转中小火计时：溏心蛋6分钟，完美熟透8-9分钟。",
      "捞出立刻投入冰水或冷水中浸泡2分钟，轻松剥出光洁白嫩的完整鸡蛋。"
    ],
    tips: "煮好后立即浸泡冷水产生热胀冷缩，蛋壳一拉整片脱落，蛋黄湿润不干喉。",
    image_url: "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?auto=format&fit=crop&w=800&q=80",
  },

  // 10. 香煎鸡胸肉
  {
    id: "recipe_pan_seared_chicken_breast",
    dish_name: "香煎鸡胸肉",
    category: "高蛋白低脂",
    cooking_time_min: 8,
    prep_time_min: 10,
    difficulty: "新手友好",
    calories: 215,
    protein_g: 36.5,
    carbs_g: 2.0,
    fat_g: 5.5,
    fiber_g: 0.5,
    ingredients: [
      { name: "新鲜鸡胸肉", amount: "200g" },
      { name: "现磨黑胡椒粉", amount: "3g" },
      { name: "生抽", amount: "10ml" },
      { name: "料酒", amount: "5ml" },
      { name: "大蒜", amount: "2瓣 (蒜末)" },
      { name: "橄榄油", amount: "4ml" },
    ],
    steps: [
      "鸡胸肉横切成两半较薄的肉排，表面用刀划十字花刀方便入味。",
      "加入生抽、料酒、黑胡椒碎、蒜末抓匀，腌制10-15分钟。",
      "平底不粘锅刷薄薄一层橄榄油烧热，放入鸡胸肉。",
      "中火慢煎2.5分钟至表面金黄微焦，翻面再煎2分钟。",
      "加盖关小火焖1分钟锁住肉汁，出锅静置1分钟后切块装盘。"
    ],
    tips: "横切变薄和关火后加盖焖1分钟是鸡胸肉鲜嫩多汁、完全不柴的终极秘诀。",
    image_url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80",
  },

  // 11. 牛肉炒洋葱
  {
    id: "recipe_beef_onion",
    dish_name: "牛肉炒洋葱",
    category: "高蛋白热炒",
    cooking_time_min: 10,
    prep_time_min: 8,
    difficulty: "简单家常",
    calories: 270,
    protein_g: 28.0,
    carbs_g: 9.5,
    fat_g: 12.0,
    fiber_g: 2.8,
    ingredients: [
      { name: "牛里脊肉", amount: "180g" },
      { name: "紫洋葱", amount: "1个 (约200g)" },
      { name: "生抽", amount: "10ml" },
      { name: "蚝油", amount: "5ml" },
      { name: "黑胡椒粒", amount: "2g" },
      { name: "淀粉", amount: "4g" },
      { name: "植物油", amount: "8ml" },
    ],
    steps: [
      "牛肉逆着纹理切薄片，加生抽、料酒、淀粉和少许油抓匀腌制10分钟。",
      "洋葱切成粗丝，姜蒜切末备用。",
      "锅烧热下油，下牛肉片大火快速滑炒至8分熟变色盛出。",
      "锅内余油炒香洋葱丝至微透明散发甜香。",
      "倒回牛肉片，加入蚝油、黑胡椒大火爆炒30秒混合均匀即可出锅。"
    ],
    tips: "牛肉必须逆纹切断肉筋纤维，大火快炒滑熟，肉质鲜嫩弹牙不塞牙。",
    image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  },

  // 12. 蒜蓉菠菜
  {
    id: "recipe_garlic_spinach",
    dish_name: "蒜蓉菠菜",
    category: "刮油蔬菜",
    cooking_time_min: 6,
    prep_time_min: 3,
    difficulty: "极速快手",
    calories: 75,
    protein_g: 4.8,
    carbs_g: 6.2,
    fat_g: 3.2,
    fiber_g: 4.5,
    ingredients: [
      { name: "新鲜菠菜", amount: "350g" },
      { name: "大蒜", amount: "4瓣 (剁成蒜末)" },
      { name: "食用油", amount: "5ml" },
      { name: "食盐", amount: "2g" },
    ],
    steps: [
      "菠菜洗净切大段，沸水中焯水30秒去除草酸，捞出控干水分。",
      "热锅下5ml油，爆香一半蒜末出香味。",
      "下入菠菜大火快速翻炒半分钟。",
      "出锅前加入少许盐和剩余的一半蒜末（生熟蒜结合），翻匀即可出锅。"
    ],
    tips: "菠菜一定要提前焯水去除多余草酸，最后加入生蒜末能让蒜香更有层次感。",
    image_url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80",
  },

  // 13. 冬瓜排骨汤
  {
    id: "recipe_winter_melon_ribs_soup",
    dish_name: "冬瓜排骨汤",
    category: "滋补清润",
    cooking_time_min: 35,
    prep_time_min: 8,
    difficulty: "简单家常",
    calories: 230,
    protein_g: 22.0,
    carbs_g: 6.5,
    fat_g: 11.5,
    fiber_g: 2.2,
    ingredients: [
      { name: "猪小排", amount: "200g" },
      { name: "冬瓜", amount: "300g (带皮或去皮切厚块)" },
      { name: "生姜", amount: "4片" },
      { name: "葱结", amount: "1个" },
      { name: "料酒", amount: "10ml" },
      { name: "食盐", amount: "3g" },
    ],
    steps: [
      "排骨剁小块冷水下锅，加姜片、料酒焯水，大滚后撇净浮沫捞出冲洗干净。",
      "砂锅或炖锅中加入足量清水，放入焯好的排骨、姜片和葱结，大火烧开转中小火炖煮25分钟。",
      "放入切厚块的冬瓜，继续慢炖10-12分钟至冬瓜呈半透明软糯状。",
      "调入适量食盐和少许白胡椒粉，撒上葱花即可出锅喝汤。"
    ],
    tips: "冬瓜可保留少许青皮一起炖煮，利尿消肿效果更佳；排骨汤一定要最后放盐，肉质更软烂。",
    image_url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
  },

  // 14. 红烧豆腐
  {
    id: "recipe_braised_tofu",
    dish_name: "红烧豆腐",
    category: "经典素食",
    cooking_time_min: 12,
    prep_time_min: 5,
    difficulty: "简单家常",
    calories: 195,
    protein_g: 15.2,
    carbs_g: 10.5,
    fat_g: 9.8,
    fiber_g: 3.0,
    ingredients: [
      { name: "老豆腐/北豆腐", amount: "300g" },
      { name: "生抽", amount: "12ml" },
      { name: "老抽", amount: "3ml (上色)" },
      { name: "蚝油", amount: "5ml" },
      { name: "大蒜", amount: "2瓣" },
      { name: "香葱", amount: "1根" },
      { name: "食用油", amount: "6ml" },
    ],
    steps: [
      "老豆腐切成约1cm厚的小方块，用厨房纸吸去表面水分。",
      "平底锅烧热刷油，整齐摆入豆腐块，中火慢煎至两面金黄微焦结皮后盛出。",
      "锅留底油爆香蒜末，倒入半碗水，加入生抽、老抽、蚝油调成红烧汁煮沸。",
      "倒入煎好的豆腐块，中小火慢煨2-3分钟让豆腐充分吸收酱汁。",
      "大火收浓汤汁，撒上翠绿葱花出锅装盘。"
    ],
    tips: "选用老豆腐切块双面慢煎结皮，能锁住豆香，在红烧焖煮时不易碎裂且外焦里嫩。",
    image_url: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80",
  },

  // 15. 清蒸鱼
  {
    id: "recipe_steamed_fish",
    dish_name: "清蒸鱼",
    category: "高蛋白海鲜",
    cooking_time_min: 12,
    prep_time_min: 6,
    difficulty: "新手友好",
    calories: 165,
    protein_g: 28.5,
    carbs_g: 1.5,
    fat_g: 3.8,
    fiber_g: 0.5,
    ingredients: [
      { name: "新鲜鲈鱼/鳊鱼", amount: "1条 (约400-500g)" },
      { name: "大葱", amount: "2根 (切细丝)" },
      { name: "生姜", amount: "1块 (切细丝与片)" },
      { name: "蒸鱼豉油", amount: "20ml" },
      { name: "热食用油", amount: "8ml" },
    ],
    steps: [
      "鱼刮鳞去内脏洗净，鱼身两侧斜划几刀，抹少许盐与料酒，鱼腹塞入姜片葱段。",
      "盘底铺几根葱姜防粘垫高，摆上鱼身，蒸锅水大火烧开上大汽。",
      "将鱼放入蒸锅，大火蒸7-8分钟，关火虚蒸2分钟。",
      "取出倒掉盘中蒸出的腥水，拿掉老葱姜，在鱼身表面铺上新鲜翠绿的葱姜细丝。",
      "沿盘边淋入蒸鱼豉油，烧热8ml食用油泼在葱姜丝上激发出扑鼻清香。"
    ],
    tips: "水大开上汽后再蒸鱼，倒掉盘底腥水是鱼肉清甜无土腥味的关键；热油泼葱丝香味扑鼻。",
    image_url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
  },

  // 16. 香菇鸡肉粥
  {
    id: "recipe_chicken_mushroom_congee",
    dish_name: "香菇鸡肉粥",
    category: "养胃轻食",
    cooking_time_min: 25,
    prep_time_min: 6,
    difficulty: "简单家常",
    calories: 225,
    protein_g: 18.5,
    carbs_g: 28.0,
    fat_g: 4.2,
    fiber_g: 2.8,
    ingredients: [
      { name: "大米/糙米", amount: "50g" },
      { name: "鸡胸肉/鸡腿肉丁", amount: "100g" },
      { name: "鲜香菇", amount: "3朵 (切薄片)" },
      { name: "姜丝", amount: "少许" },
      { name: "生抽", amount: "5ml" },
      { name: "食盐", amount: "2g" },
      { name: "香葱花", amount: "适量" },
    ],
    steps: [
      "大米淘洗干净，锅中加水大火烧开，转中小火慢熬20分钟至米粒开花粘稠。",
      "鸡肉切小丁，加入少许生抽、料酒、淀粉和姜丝腌制5分钟。",
      "将香菇片倒入沸腾的白粥中煮3分钟出菌香。",
      "转中大火，下入腌制好的鸡肉丁快速划散煮至肉色变白熟透（约2分钟）。",
      "加入适量盐、白胡椒粉调味，撒上小葱花即可温热暖胃享用。"
    ],
    tips: "鸡肉丁最后下锅快速滑熟能保持肉质鲜嫩多汁不发硬，粥底绵密清鲜。",
    image_url: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80",
  },

  // 17. 西红柿鸡蛋面
  {
    id: "recipe_tomato_egg_noodles",
    dish_name: "西红柿鸡蛋面",
    category: "暖心主食",
    cooking_time_min: 12,
    prep_time_min: 4,
    difficulty: "极速快手",
    calories: 340,
    protein_g: 16.5,
    carbs_g: 52.0,
    fat_g: 7.8,
    fiber_g: 3.8,
    ingredients: [
      { name: "荞麦面/鲜面条", amount: "70g" },
      { name: "熟番茄", amount: "2个" },
      { name: "鸡蛋", amount: "1个" },
      { name: "生抽", amount: "8ml" },
      { name: "香葱", amount: "1根" },
      { name: "食盐", amount: "2g" },
    ],
    steps: [
      "番茄切块，葱切花。锅内下少许油煎一个荷包蛋盛出备用。",
      "锅底爆香葱白，倒入番茄块翻炒出红亮浓郁的汤汁。",
      "倒入大半碗开水，加入生抽和盐煮沸成浓郁番茄汤底。",
      "下入面条煮3-4分钟至断生爽滑。",
      "铺上午餐荷包蛋，撒上葱花，连汤带面盛入大碗中。"
    ],
    tips: "番茄充分炒出沙再加开水，汤头红亮酸甜浓稠，选用荞麦面减脂饱腹感更强。",
    image_url: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=800&q=80",
  },

  // 18. 黑椒牛肉粒
  {
    id: "recipe_black_pepper_beef",
    dish_name: "黑椒牛肉粒",
    category: "高蛋白精致",
    cooking_time_min: 10,
    prep_time_min: 8,
    difficulty: "中等难度",
    calories: 290,
    protein_g: 32.0,
    carbs_g: 7.5,
    fat_g: 13.5,
    fiber_g: 2.5,
    ingredients: [
      { name: "牛菲力/牛里脊", amount: "220g" },
      { name: "彩椒/青椒", amount: "1个 (切块)" },
      { name: "洋葱", amount: "半个" },
      { name: "黑胡椒酱/现磨黑胡椒", amount: "15ml" },
      { name: "生抽", amount: "8ml" },
      { name: "大蒜", amount: "4瓣 (去皮整粒)" },
    ],
    steps: [
      "牛肉切成1.5cm见方小粒，加生抽、黑胡椒碎、少许淀粉和食用油腌制10分钟。",
      "热锅下油，先下整颗大蒜粒煎至表面微金黄焦香。",
      "下入牛肉粒大火快速翻炒封边锁住肉汁（约1-2分钟至表面变色）。",
      "加入洋葱块和彩椒块一同翻炒断生。",
      "淋入黑胡椒酱和生抽，大火颠锅裹匀酱汁即可出锅。"
    ],
    tips: "牛肉粒切厚块大火快炒锁住内部肉汁，整粒蒜煎出蒜油搭配黑椒风味绝佳。",
    image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  },

  // 19. 荷兰豆炒虾仁
  {
    id: "recipe_snow_peas_shrimp",
    dish_name: "荷兰豆炒虾仁",
    category: "清爽高蛋白",
    cooking_time_min: 8,
    prep_time_min: 5,
    difficulty: "极速快手",
    calories: 160,
    protein_g: 22.0,
    carbs_g: 6.8,
    fat_g: 4.5,
    fiber_g: 3.2,
    ingredients: [
      { name: "鲜虾仁", amount: "180g" },
      { name: "鲜嫩荷兰豆", amount: "150g" },
      { name: "大蒜", amount: "2瓣" },
      { name: "生抽/盐", amount: "适量" },
      { name: "料酒", amount: "5ml" },
      { name: "食用油", amount: "5ml" },
    ],
    steps: [
      "虾仁开背去虾线，加少许料酒、白胡椒粉抓匀腌制5分钟。",
      "荷兰豆撕去两边老筋洗净，沸水中焯水30秒捞出过凉水控干。",
      "热锅下油爆香蒜末，倒入虾仁滑炒至变红卷曲。",
      "倒入焯好的荷兰豆大火快速翻炒均匀。",
      "加入适量盐和少许白胡椒调味，翻炒均匀出锅。"
    ],
    tips: "荷兰豆焯水过凉水保持爽脆碧绿，与高蛋白虾仁搭配低脂低卡色彩诱人。",
    image_url: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80",
  },

  // 20. 手撕包菜
  {
    id: "recipe_hand_torn_cabbage",
    dish_name: "手撕包菜",
    category: "减脂素菜",
    cooking_time_min: 6,
    prep_time_min: 4,
    difficulty: "极速快手",
    calories: 105,
    protein_g: 3.5,
    carbs_g: 10.0,
    fat_g: 4.8,
    fiber_g: 4.5,
    ingredients: [
      { name: "卷心菜/包菜", amount: "300g" },
      { name: "干辣椒/蒜瓣", amount: "适量" },
      { name: "生抽", amount: "10ml" },
      { name: "香醋/陈醋", amount: "8ml" },
      { name: "食用油", amount: "6ml" },
      { name: "白糖/代糖", amount: "2g" },
    ],
    steps: [
      "包菜用手撕成适口大片，洗净并彻底甩干表面水分（水分多会影响焦香脆度）。",
      "热锅下油，下入蒜片和干辣椒段小火煸出香辣味。",
      "转大火倒入包菜，快速翻炒至叶片变软呈半透明状态（约1-2分钟）。",
      "沿锅边淋入生抽、香醋、少许盐和代糖提鲜。",
      "大火快速颠锅翻炒均匀激发锅气，立刻出锅装盘。"
    ],
    tips: "包菜一定要用手撕且彻底沥干水分，大火快炒沿锅边烹醋，脆嫩带锅气。",
    image_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
  },

  // 21. 醋溜土豆丝
  {
    id: "recipe_vinegar_potato_strips",
    dish_name: "醋溜土豆丝",
    category: "经典家常菜",
    cooking_time_min: 8,
    prep_time_min: 6,
    difficulty: "极速快手",
    calories: 155,
    protein_g: 3.2,
    carbs_g: 28.0,
    fat_g: 3.8,
    fiber_g: 3.5,
    ingredients: [
      { name: "土豆", amount: "1-2个 (约250g)" },
      { name: "青椒/红椒丝", amount: "少许" },
      { name: "白醋/陈醋", amount: "15ml" },
      { name: "大蒜", amount: "2瓣" },
      { name: "食用油", amount: "5ml" },
      { name: "食盐", amount: "2g" },
    ],
    steps: [
      "土豆去皮切成细丝，放入清水中多淘洗两遍洗去多余表面淀粉，沥干备用。",
      "热锅下油，爆香蒜末和少许花椒粒或干辣椒。",
      "倒入土豆丝大火快速翻炒1分钟至微微变透明。",
      "烹入半勺白醋保持爽脆，加入青红椒丝翻炒断生。",
      "加入适量盐调味，出锅前再沿锅边淋少许醋激发酸香，翻匀出锅。"
    ],
    tips: "洗净土豆丝表面淀粉，分两次烹入食醋（炒中加醋脆爽、出锅加醋提香），口感格外爽脆。",
    image_url: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=800&q=80",
  },

  // 22. 苦瓜炒蛋
  {
    id: "recipe_bitter_melon_egg",
    dish_name: "苦瓜炒蛋",
    category: "清热刮油",
    cooking_time_min: 8,
    prep_time_min: 4,
    difficulty: "极速快手",
    calories: 165,
    protein_g: 13.5,
    carbs_g: 5.5,
    fat_g: 10.5,
    fiber_g: 2.8,
    ingredients: [
      { name: "苦瓜", amount: "1根" },
      { name: "鸡蛋", amount: "3个" },
      { name: "食盐", amount: "2g" },
      { name: "食用油", amount: "6ml" },
    ],
    steps: [
      "苦瓜对半剖开，用勺子刮干净白色内膜（去苦关键），切成薄片。",
      "苦瓜片加少许盐抓匀腌制3分钟，用清水冲洗并挤干水分。",
      "鸡蛋打散加少许盐，锅中热油倒入蛋液滑炒凝固盛出。",
      "锅留底油下苦瓜片大火翻炒至断生变软。",
      "倒入炒好的鸡蛋块翻炒均匀即可出锅。"
    ],
    tips: "把苦瓜白瓤用勺子刮干净，用盐抓腌挤出苦汁，苦味大大降低且清脆甘甜。",
    image_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
  },

  // 23. 娃娃菜豆腐汤
  {
    id: "recipe_baby_cabbage_tofu_soup",
    dish_name: "娃娃菜豆腐汤",
    category: "刮油清汤",
    cooking_time_min: 10,
    prep_time_min: 3,
    difficulty: "极速快手",
    calories: 110,
    protein_g: 9.5,
    carbs_g: 7.2,
    fat_g: 4.5,
    fiber_g: 3.5,
    ingredients: [
      { name: "娃娃菜", amount: "1颗" },
      { name: "嫩豆腐", amount: "200g" },
      { name: "枸杞", amount: "10粒" },
      { name: "生抽", amount: "5ml" },
      { name: "食盐", amount: "2g" },
      { name: "香油", amount: "2ml" },
    ],
    steps: [
      "娃娃菜洗净切条，嫩豆腐切小方块备用。",
      "锅中倒入适量清水或清汤烧沸。",
      "下入豆腐块和娃娃菜，大火煮沸后转中小火炖煮5分钟至菜叶软烂。",
      "调入适量食盐、白胡椒粉和枸杞煮1分钟。",
      "出锅前滴入两滴香油增香即可热气腾腾出锅。"
    ],
    tips: "娃娃菜自身的甘甜与豆腐的豆香完美融合，无需多余调料即可清甜暖胃。",
    image_url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
  },

  // 24. 木耳炒肉片
  {
    id: "recipe_black_fungus_pork",
    dish_name: "木耳炒肉片",
    category: "经典家常菜",
    cooking_time_min: 10,
    prep_time_min: 6,
    difficulty: "简单家常",
    calories: 235,
    protein_g: 22.0,
    carbs_g: 7.5,
    fat_g: 12.5,
    fiber_g: 4.8,
    ingredients: [
      { name: "瘦猪肉", amount: "150g" },
      { name: "干木耳 (泡发洗净)", amount: "100g" },
      { name: "胡萝卜片/青椒片", amount: "少许" },
      { name: "大蒜", amount: "2瓣" },
      { name: "生抽", amount: "10ml" },
      { name: "食用油", amount: "6ml" },
    ],
    steps: [
      "猪肉切薄片，加少许生抽、料酒、淀粉抓匀腌制5分钟。",
      "泡发好的木耳撕小朵，沸水中焯水1分钟捞出控干防炸锅。",
      "热锅下油，先滑炒肉片至变色8成熟盛出。",
      "锅中爆香蒜末，倒入木耳、胡萝卜片大火翻炒2分钟。",
      "倒回肉片，加入适量生抽、少许盐翻炒均匀出锅。"
    ],
    tips: "木耳提前焯水并沥干水分，下油锅炒时不易噼啪炸锅，口感脆嫩有嚼劲。",
    image_url: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80",
  },

  // 25. 彩椒炒鸡丁
  {
    id: "recipe_chicken_bell_peppers",
    dish_name: "彩椒炒鸡丁",
    category: "高蛋白低脂",
    cooking_time_min: 8,
    prep_time_min: 5,
    difficulty: "极速快手",
    calories: 220,
    protein_g: 30.5,
    carbs_g: 8.0,
    fat_g: 6.5,
    fiber_g: 2.8,
    ingredients: [
      { name: "鸡胸肉/鸡腿肉", amount: "200g" },
      { name: "红黄绿三色甜椒", amount: "各半个 (切方丁)" },
      { name: "生抽", amount: "10ml" },
      { name: "蚝油", amount: "5ml" },
      { name: "淀粉", amount: "3g" },
      { name: "食用油", amount: "5ml" },
    ],
    steps: [
      "鸡肉切1.5cm小丁，加生抽、料酒、淀粉腌制5分钟入味锁水。",
      "彩椒洗净去籽切小方丁，大蒜切片。",
      "热锅温油下鸡丁快速划散翻炒至肉色变白8成熟盛出。",
      "锅底爆香蒜片，倒入彩椒丁大火翻炒半分钟至断生爽甜。",
      "倒入鸡丁，加少许蚝油和生抽翻炒均匀裹汁出锅。"
    ],
    tips: "彩椒富含维生素C，大火快炒保持清脆甜嫩，色彩绚丽增进食欲。",
    image_url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80",
  },

  // 26. 水煮牛肉轻卡版
  {
    id: "recipe_light_boiled_beef",
    dish_name: "水煮牛肉轻卡版",
    category: "减脂硬菜",
    cooking_time_min: 15,
    prep_time_min: 10,
    difficulty: "中等难度",
    calories: 260,
    protein_g: 34.0,
    carbs_g: 8.5,
    fat_g: 9.5,
    fiber_g: 4.2,
    ingredients: [
      { name: "牛里脊肉", amount: "220g" },
      { name: "豆芽/白菜叶", amount: "150g (垫底用)" },
      { name: "豆瓣酱 (少油版)", amount: "10g" },
      { name: "花椒粉/辣椒粉", amount: "各2g" },
      { name: "大蒜末/葱花", amount: "适量" },
      { name: "热油", amount: "5ml (淋油封香)" },
    ],
    steps: [
      "牛肉逆纹切薄片，加入生抽、料酒、蛋清和淀粉抓匀上浆。",
      "锅中少油翻炒豆芽和白菜断生，铺入大碗底部作为菜底。",
      "锅内少油炒香豆瓣酱和葱姜蒜末，加入一碗清水或高汤煮沸5分钟滤去料渣。",
      "保持汤底大滚，关小火将牛肉片逐片展开下锅，大火烫煮1分钟至肉片变色熟嫩捞出铺在菜底上。",
      "撒上蒜末、葱花、花椒粉和辣椒粉，淋上一小勺热油激发出浓郁麻辣香气。"
    ],
    tips: "改用大汤煮熟肉片配合极少油淋油，保留传统川味麻辣过瘾口感同时大幅降低油脂热量。",
    image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  },

  // 27. 黄瓜炒蛋
  {
    id: "recipe_cucumber_egg",
    dish_name: "黄瓜炒蛋",
    category: "快手清爽",
    cooking_time_min: 6,
    prep_time_min: 3,
    difficulty: "极速快手",
    calories: 175,
    protein_g: 13.0,
    carbs_g: 6.0,
    fat_g: 11.0,
    fiber_g: 1.8,
    ingredients: [
      { name: "清脆黄瓜", amount: "1根" },
      { name: "鸡蛋", amount: "3个" },
      { name: "香葱", amount: "1根" },
      { name: "食用油", amount: "6ml" },
      { name: "食盐", amount: "2g" },
    ],
    steps: [
      "黄瓜洗净切菱形薄片，鸡蛋打散加少许盐搅拌均匀。",
      "锅内下油烧热，倒入蛋液快速滑炒成金黄大块盛出。",
      "锅底余油下葱花爆香，倒入黄瓜片大火快炒半分钟至断生。",
      "倒回炒好的鸡蛋，调入适量盐翻炒均匀即可出锅。"
    ],
    tips: "黄瓜切薄片大火快速翻炒，不可久炒，保持黄瓜的清脆瓜香与多汁口感。",
    image_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
  },

  // 28. 金针菇肥牛
  {
    id: "recipe_enoki_beef",
    dish_name: "金针菇肥牛",
    category: "高蛋白硬菜",
    cooking_time_min: 10,
    prep_time_min: 4,
    difficulty: "简单家常",
    calories: 280,
    protein_g: 26.0,
    carbs_g: 7.0,
    fat_g: 15.5,
    fiber_g: 3.5,
    ingredients: [
      { name: "优质原切肥牛卷", amount: "180g" },
      { name: "金针菇", amount: "150g" },
      { name: "大蒜/生姜", amount: "适量" },
      { name: "生抽", amount: "12ml" },
      { name: "蚝油", amount: "8ml" },
      { name: "黑胡椒", amount: "少许" },
    ],
    steps: [
      "金针菇去根洗净撕成小撮，肥牛卷沸水中焯烫20秒变色捞出沥水去血沫油脂。",
      "锅内少许底油爆香蒜末，放入金针菇翻炒出水变软。",
      "倒入生抽、蚝油和少许清水煮沸。",
      "加入焯好的肥牛卷大火快速翻炒裹满汤汁（约30秒）。",
      "撒上现磨黑胡椒碎和葱花即可出锅。"
    ],
    tips: "肥牛卷先焯水能去除多余油脂与浮沫，使汤汁清爽不油腻。",
    image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  },

  // 29. 酸汤肥牛轻食版
  {
    id: "recipe_sour_soup_beef",
    dish_name: "酸汤肥牛轻食版",
    category: "开胃硬菜",
    cooking_time_min: 12,
    prep_time_min: 5,
    difficulty: "简单家常",
    calories: 275,
    protein_g: 27.5,
    carbs_g: 9.0,
    fat_g: 13.5,
    fiber_g: 3.2,
    ingredients: [
      { name: "肥牛卷", amount: "180g" },
      { name: "金针菇/魔芋丝", amount: "150g" },
      { name: "黄灯笼辣椒酱/酸汤调料", amount: "15g" },
      { name: "白醋/泡椒水", amount: "10ml" },
      { name: "蒜末/葱花", amount: "适量" },
    ],
    steps: [
      "金针菇和魔芋丝焯水断生，铺在大碗底部。",
      "肥牛卷在沸水中汆烫20秒捞出沥干备用。",
      "锅底少油爆香蒜末与黄灯笼辣椒酱，加入两碗开水或高汤煮沸3分钟出酸辣金汤。",
      "调入白醋和少许盐，倒入焯好的肥牛片微煮半分钟吸汁。",
      "连汤带肉倒入盛有金针菇的大碗中，撒上青红椒圈和蒜末即可。"
    ],
    tips: "金汤酸辣开胃，肥牛焯水减油，魔芋丝和金针菇垫底低卡高饱腹。",
    image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  },

  // 30. 洋葱炒蛋
  {
    id: "recipe_onion_egg",
    dish_name: "洋葱炒蛋",
    category: "快手家常菜",
    cooking_time_min: 8,
    prep_time_min: 4,
    difficulty: "极速快手",
    calories: 190,
    protein_g: 14.0,
    carbs_g: 11.5,
    fat_g: 10.5,
    fiber_g: 2.8,
    ingredients: [
      { name: "紫洋葱", amount: "1个 (约200g)" },
      { name: "鸡蛋", amount: "3个" },
      { name: "生抽", amount: "8ml" },
      { name: "食用油", amount: "6ml" },
      { name: "食盐", amount: "2g" },
    ],
    steps: [
      "洋葱切成粗丝，鸡蛋打散加少许盐搅拌均匀。",
      "热锅下油倒入蛋液，大火滑炒凝固盛出。",
      "锅底余油下洋葱丝大火翻炒2分钟至微透明散发清甜香气。",
      "倒入炒好的鸡蛋，淋入生抽和少许盐翻炒均匀即可出锅。"
    ],
    tips: "洋葱炒至微微透明出甜味后再加鸡蛋，洋葱的天然甜香融入蛋块格外下饭。",
    image_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
  },

  // 31. 胡萝卜炒肉
  {
    id: "recipe_carrot_pork",
    dish_name: "胡萝卜炒肉",
    category: "营养家常菜",
    cooking_time_min: 10,
    prep_time_min: 5,
    difficulty: "简单家常",
    calories: 240,
    protein_g: 21.0,
    carbs_g: 12.0,
    fat_g: 11.5,
    fiber_g: 3.5,
    ingredients: [
      { name: "胡萝卜", amount: "1根 (切细丝/薄片)" },
      { name: "瘦肉", amount: "150g (切丝/切片)" },
      { name: "生抽", amount: "10ml" },
      { name: "食用油", amount: "6ml" },
      { name: "蒜片", amount: "2瓣" },
    ],
    steps: [
      "瘦肉切丝加生抽、料酒、淀粉抓匀腌制5分钟。",
      "胡萝卜去皮切成细丝或菱形薄片备用。",
      "热锅下油滑炒肉丝至变色熟嫩盛出。",
      "锅中爆香蒜片，倒入胡萝卜丝中火翻炒2分钟充分溶出胡萝卜素。",
      "倒回肉丝，加入少许盐和生抽翻炒均匀即可出锅。"
    ],
    tips: "胡萝卜素是脂溶性维生素，用适量食用油过油煸炒更容易被人体充分吸收利用。",
    image_url: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80",
  },

  // 32. 芹菜炒牛肉
  {
    id: "recipe_celery_beef",
    dish_name: "芹菜炒牛肉",
    category: "高蛋白高纤",
    cooking_time_min: 8,
    prep_time_min: 6,
    difficulty: "简单家常",
    calories: 235,
    protein_g: 30.0,
    carbs_g: 5.5,
    fat_g: 9.8,
    fiber_g: 3.8,
    ingredients: [
      { name: "牛里脊肉", amount: "180g" },
      { name: "香芹/西芹", amount: "150g" },
      { name: "红辣椒丝/蒜末", amount: "适量" },
      { name: "生抽", amount: "10ml" },
      { name: "蚝油", amount: "5ml" },
      { name: "食用油", amount: "6ml" },
    ],
    steps: [
      "牛肉逆纹切细丝，加生抽、料酒、淀粉抓匀腌制10分钟。",
      "芹菜拍扁斜切成寸段备用。",
      "热锅热油下牛肉丝大火快速滑散炒至变色迅速盛出。",
      "锅中爆香蒜末和辣椒丝，倒入芹菜大火快炒1分钟至断生爽脆。",
      "倒回牛肉丝，加入蚝油大火翻炒15秒裹匀出锅。"
    ],
    tips: "芹菜粗纤维丰富降压刮油，牛肉高蛋白饱腹，大火爆炒保持芹菜极度爽脆。",
    image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  },

  // 33. 西兰花炒虾仁
  {
    id: "recipe_broccoli_shrimp",
    dish_name: "西兰花炒虾仁",
    category: "经典减脂餐",
    cooking_time_min: 8,
    prep_time_min: 5,
    difficulty: "极速快手",
    calories: 165,
    protein_g: 24.5,
    carbs_g: 7.2,
    fat_g: 3.8,
    fiber_g: 4.2,
    ingredients: [
      { name: "新鲜虾仁", amount: "180g" },
      { name: "西兰花", amount: "200g" },
      { name: "大蒜", amount: "3瓣 (切蒜末)" },
      { name: "黑胡椒粉", amount: "1g" },
      { name: "生抽/盐", amount: "适量" },
      { name: "橄榄油", amount: "5ml" },
    ],
    steps: [
      "虾仁去虾线加少许料酒、黑胡椒抓匀腌制；西兰花切小朵。",
      "沸水加少许盐和油，下西兰花焯水45秒捞出过凉水控干。",
      "平底锅热油爆香蒜末，倒入虾仁两面煎至变红卷曲。",
      "倒入西兰花大火翻炒半分钟，调入少许盐和黑胡椒碎翻匀出锅。"
    ],
    tips: "减脂健身界的王牌CP，高蛋白+高膳食纤维，清爽少油高颜值。",
    image_url: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80",
  },

  // 34. 清炒虾仁
  {
    id: "recipe_stir_fried_shrimp",
    dish_name: "清炒虾仁",
    category: "鲜美高蛋白",
    cooking_time_min: 5,
    prep_time_min: 5,
    difficulty: "极速快手",
    calories: 150,
    protein_g: 26.0,
    carbs_g: 2.0,
    fat_g: 3.5,
    fiber_g: 0.2,
    ingredients: [
      { name: "鲜活河虾仁/海虾仁", amount: "220g" },
      { name: "黄瓜丁/胡萝卜丁", amount: "少许 (点缀)" },
      { name: "葱姜汁", amount: "5ml" },
      { name: "蛋清", amount: "半个" },
      { name: "淀粉", amount: "3g" },
      { name: "食用油", amount: "5ml" },
    ],
    steps: [
      "虾仁用厨房纸彻底吸干水分，加蛋清、少许盐、淀粉顺时针抓至起胶上浆。",
      "热锅下油，油温四成热下虾仁快速滑散至变白卷曲成球状捞出。",
      "锅底留少许油爆香葱姜汁，下入点缀蔬菜丁翻炒断生。",
      "倒入虾仁大火翻炒数秒，调入少许盐翻匀出锅。"
    ],
    tips: "虾仁吸干水分并用蛋清上浆，温油滑炒出来的虾仁晶莹剔透、爽脆弹牙。",
    image_url: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80",
  },

  // 35. 南瓜燕麦粥
  {
    id: "recipe_pumpkin_oat_porridge",
    dish_name: "南瓜燕麦粥",
    category: "优质低卡主食",
    cooking_time_min: 15,
    prep_time_min: 3,
    difficulty: "极速快手",
    calories: 160,
    protein_g: 5.5,
    carbs_g: 32.0,
    fat_g: 2.2,
    fiber_g: 5.0,
    ingredients: [
      { name: "老南瓜/贝贝南瓜", amount: "150g (去皮切小丁)" },
      { name: "传统生燕麦片/快熟燕麦", amount: "40g" },
      { name: "清水/脱脂牛奶", amount: "350ml" },
      { name: "奇亚籽 (可选)", amount: "5g" },
    ],
    steps: [
      "南瓜去皮去瓤切成小薄块，放入锅中加清水大火煮开转小火煮8分钟至软烂。",
      "用勺背将部分南瓜压成泥，汤底呈现金黄浓郁色泽。",
      "倒入燕麦片搅拌均匀，小火继续慢熬3-5分钟至燕麦浓稠开花。",
      "关火出锅倒入碗中，可撒上少许奇亚籽或坚果碎增添口感。"
    ],
    tips: "南瓜本身自带清甜与果胶，熬出的燕麦粥软糯香浓，高纤饱腹感持续一上午。",
    image_url: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80",
  },

  // 36. 小米红薯粥
  {
    id: "recipe_millet_sweet_potato_porridge",
    dish_name: "小米红薯粥",
    category: "养胃主食",
    cooking_time_min: 25,
    prep_time_min: 4,
    difficulty: "新手友好",
    calories: 190,
    protein_g: 4.2,
    carbs_g: 41.0,
    fat_g: 1.5,
    fiber_g: 3.5,
    ingredients: [
      { name: "优质金黄小米", amount: "40g" },
      { name: "红薯", amount: "1小个 (约120g)" },
      { name: "枸杞", amount: "8粒" },
      { name: "清水", amount: "500ml" },
    ],
    steps: [
      "红薯去皮切滚刀小块，小米轻柔淘洗一遍沥干。",
      "砂锅中加入足量清水大火烧沸后下入小米和红薯块。",
      "大火煮沸后转小火慢炖20分钟，中途顺时针搅拌两次防止粘底并促进米油析出。",
      "熬至红薯软糯、小米粥浓稠起厚厚米油，加入洗净的枸杞再焖煮2分钟关火。"
    ],
    tips: "水开后再下小米，小火慢熬不揭盖，能熬出金黄浓厚的营养米油，极度养脾胃。",
    image_url: "https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?auto=format&fit=crop&w=800&q=80",
  },

  // 37. 清蒸生蚝
  {
    id: "recipe_steamed_oysters",
    dish_name: "清蒸生蚝",
    category: "锌动力海鲜",
    cooking_time_min: 6,
    prep_time_min: 5,
    difficulty: "极速快手",
    calories: 120,
    protein_g: 16.5,
    carbs_g: 6.0,
    fat_g: 2.8,
    fiber_g: 0.0,
    ingredients: [
      { name: "带壳鲜活生蚝", amount: "6-8个" },
      { name: "生姜丝", amount: "少许" },
      { name: "海鲜酱油/芥末酱油蘸料", amount: "适量" },
    ],
    steps: [
      "生蚝用刷子刷洗干净外壳泥沙。",
      "蒸锅加水大火烧沸上大汽，将生蚝平平整整摆在蒸屉上（深壳朝下锁住鲜汁）。",
      "盖上锅盖大火蒸4-5分钟至外壳微微张开一条小缝即关火。",
      "取出掰开上壳，蘸上海鲜酱油或蒜蓉辣酱，连肉带汁吸入口中鲜甜爆汁。"
    ],
    tips: "深壳朝下摆放蒸制能牢牢锁住鲜美生蚝原汤，大火蒸4-5分钟刚刚熟嫩最肥美。",
    image_url: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80",
  },

  // 38. 蒜蓉生蚝
  {
    id: "recipe_garlic_roasted_oysters",
    dish_name: "蒜蓉生蚝",
    category: "风味海鲜",
    cooking_time_min: 8,
    prep_time_min: 8,
    difficulty: "简单家常",
    calories: 165,
    protein_g: 17.0,
    carbs_g: 7.5,
    fat_g: 7.0,
    fiber_g: 0.5,
    ingredients: [
      { name: "带壳生蚝", amount: "6-8个 (开壳洗净)" },
      { name: "大蒜", amount: "1整头 (剁细蒜蓉)" },
      { name: "小米辣/葱花", amount: "适量" },
      { name: "生抽", amount: "15ml" },
      { name: "蚝油", amount: "8ml" },
      { name: "食用油", amount: "8ml" },
    ],
    steps: [
      "生蚝开壳洗净沥干，摆入蒸盘或烤盘中。",
      "锅中小火热油，倒入2/3蒜蓉小火慢炒出金黄蒜香，关火倒入剩下1/3生蒜蓉，加入生抽、蚝油拌匀成金银蒜蓉酱。",
      "将调好的金银蒜蓉酱均匀舀在每个生蚝肉上。",
      "蒸锅水开后放入大火蒸5-6分钟，出锅撒上葱花和小米辣碎即可享用。"
    ],
    tips: "熟蒜出香生蒜提辛（金银蒜），蒜香渗透进蚝肉肥嫩爽滑无比。",
    image_url: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80",
  },

  // 39. 清蒸鲈鱼
  {
    id: "recipe_steamed_seabass",
    dish_name: "清蒸鲈鱼",
    category: "高蛋白精致",
    cooking_time_min: 10,
    prep_time_min: 5,
    difficulty: "新手友好",
    calories: 170,
    protein_g: 30.0,
    carbs_g: 1.0,
    fat_g: 4.2,
    fiber_g: 0.5,
    ingredients: [
      { name: "鲜活鲈鱼", amount: "1条 (约500g)" },
      { name: "大葱丝/生姜丝", amount: "各适量" },
      { name: "蒸鱼豉油", amount: "20ml" },
      { name: "食用油", amount: "8ml" },
    ],
    steps: [
      "鲈鱼处理干净擦干水分，在鱼背两侧各划一刀便于成熟均匀。",
      "蒸盘底垫几根葱段，放上鲈鱼，鱼身覆上少许葱姜片。",
      "蒸锅水大沸上汽后入锅，盖盖大火蒸7-8分钟，关火焖2分钟。",
      "倒掉盘底蒸鱼汁水，去除旧葱姜，铺上厚厚一层新鲜葱姜细丝。",
      "淋入蒸鱼豉油，将烧至冒烟的热油淋在葱丝上激发出香味即可。"
    ],
    tips: "鲈鱼肉质呈蒜瓣状细嫩鲜甜，蒸制控制在8分钟内，倒掉盘底水肉质鲜美不腥。",
    image_url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
  },

  // 40. 番茄金针菇豆腐汤
  {
    id: "recipe_tomato_enoki_tofu_soup",
    dish_name: "番茄金针菇豆腐汤",
    category: "减脂神汤",
    cooking_time_min: 10,
    prep_time_min: 4,
    difficulty: "极速快手",
    calories: 125,
    protein_g: 10.5,
    carbs_g: 12.0,
    fat_g: 3.8,
    fiber_g: 4.2,
    ingredients: [
      { name: "番茄", amount: "2个 (切丁)" },
      { name: "金针菇", amount: "100g" },
      { name: "嫩豆腐", amount: "150g" },
      { name: "香葱", amount: "1根" },
      { name: "生抽/盐", amount: "适量" },
      { name: "食用油", amount: "4ml" },
    ],
    steps: [
      "热锅下少许油，下番茄丁大火炒出浓郁沙沙的红亮汤汁。",
      "加入两碗开水大火煮沸。",
      "下入金针菇和嫩豆腐方块，中小火慢煮5分钟让食材充分吸饱番茄酸甜汤汁。",
      "加入少许生抽、食盐和白胡椒粉调味，撒上葱花即可热气腾腾出锅。"
    ],
    tips: "番茄炒出浓汁再加水，汤底自带天然酸甜开胃风味，金针菇高纤维排油极佳。",
    image_url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
  },

  // 41. 上汤娃娃菜
  {
    id: "recipe_superior_broth_baby_cabbage",
    dish_name: "上汤娃娃菜",
    category: "经典粤味",
    cooking_time_min: 12,
    prep_time_min: 5,
    difficulty: "简单家常",
    calories: 145,
    protein_g: 8.5,
    carbs_g: 9.0,
    fat_g: 8.0,
    fiber_g: 3.5,
    ingredients: [
      { name: "娃娃菜", amount: "2颗 (一剖为四)" },
      { name: "皮蛋", amount: "1个 (切小丁)" },
      { name: "火腿/咸鸭蛋黄", amount: "适量 (切丁)" },
      { name: "大蒜", amount: "4瓣" },
      { name: "清鸡汤/开水", amount: "1大碗" },
      { name: "枸杞", amount: "少许" },
    ],
    steps: [
      "娃娃菜洗净竖切成四瓣，沸水中加少许盐焯水1分钟捞出摆盘。",
      "锅内少许油煎香整颗蒜瓣至表面金黄，下入皮蛋丁和火腿丁翻炒出焦香。",
      "倒入一大碗高汤或开水，大火滚煮3分钟使汤色呈现奶白浓郁。",
      "调入少许白胡椒粉和盐，撒入枸杞。",
      "将浓郁上汤连同皮蛋丁、蒜瓣一同浇在摆好盘的娃娃菜上。"
    ],
    tips: "皮蛋与大蒜煎香后大火滚水能冲出奶白鲜美的上汤，娃娃菜吸收汤汁后清甜浓郁。",
    image_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
  },

  // 42. 蒸甜玉米
  {
    id: "recipe_steamed_sweet_corn",
    dish_name: "蒸玉米",
    category: "优质主食",
    cooking_time_min: 15,
    prep_time_min: 2,
    difficulty: "极速快手",
    calories: 170,
    protein_g: 5.5,
    carbs_g: 36.0,
    fat_g: 2.0,
    fiber_g: 4.8,
    ingredients: [
      { name: "甜玉米/水果玉米/糯玉米", amount: "2根" },
      { name: "清水", amount: "适量 (蒸锅用)" },
    ],
    steps: [
      "玉米剥去外层老叶，保留最里面一层薄薄嫩皮和玉米须洗净（留皮锁住清甜香气）。",
      "蒸锅水烧开后，将玉米放入蒸屉中。",
      "盖上锅盖，大火蒸12-15分钟至玉米粒饱满透亮散发天然谷物清香。",
      "关火取出剥开外皮即可热气腾腾享用。"
    ],
    tips: "保留最内层一层薄苞叶蒸，能牢牢锁住玉米的天然甜度与水分，口感格外多汁饱满。",
    image_url: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80",
  },

  // 43. 杂粮紫薯饭
  {
    id: "recipe_purple_potato_grain_rice",
    dish_name: "杂粮紫薯饭",
    category: "减脂主食",
    cooking_time_min: 30,
    prep_time_min: 5,
    difficulty: "新手友好",
    calories: 210,
    protein_g: 5.8,
    carbs_g: 44.0,
    fat_g: 1.2,
    fiber_g: 5.5,
    ingredients: [
      { name: "大米/糙米/燕麦米", amount: "60g" },
      { name: "新鲜紫薯", amount: "1小个 (约100g)" },
      { name: "清水", amount: "适量" },
    ],
    steps: [
      "杂粮大米淘洗干净，紫薯去皮切成1cm小方丁。",
      "将洗净的大米和紫薯丁放入电饭煲内胆中拌匀。",
      "加入略多于平时煮饭的水量（约1:1.3）。",
      "按下煮饭键正常蒸煮完成后，开盖用饭勺翻拌均匀，让米粒充分吸附紫薯花青素。",
      "盛出即是一碗高颜值紫色梦幻、香甜软糯的低GI减脂主食。"
    ],
    tips: "紫薯富含花青素与高膳食纤维，与糙米杂粮同煮能延缓血糖上升，饱腹感翻倍。",
    image_url: "https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?auto=format&fit=crop&w=800&q=80",
  },

  // 44. 无油黑椒牛排
  {
    id: "recipe_pan_seared_steak",
    dish_name: "无油黑椒牛排",
    category: "高蛋白硬菜",
    cooking_time_min: 8,
    prep_time_min: 5,
    difficulty: "新手友好",
    calories: 280,
    protein_g: 38.0,
    carbs_g: 1.5,
    fat_g: 12.0,
    fiber_g: 0.5,
    ingredients: [
      { name: "原切眼肉/菲力牛排", amount: "200g" },
      { name: "现磨黑胡椒碎", amount: "3g" },
      { name: "海盐", amount: "2g" },
      { name: "大蒜", amount: "2瓣 (拍扁)" },
      { name: "迷迭香 (可选)", amount: "1枝" },
    ],
    steps: [
      "牛排提前室温回温20分钟，用厨房纸彻底吸干表面血水。",
      "表面均匀撒上海盐和现磨黑胡椒碎腌制3分钟。",
      "不粘铸铁锅大火干烧至冒青烟，直接放入牛排（利用牛肉自带天然油脂）。",
      "大火每面各煎1.5分钟封边锁住肉汁，放入蒜瓣与迷迭香增香。",
      "出锅放置在温热盘子中静置醒肉（Resting）3-5分钟，锁紧肉汁后切条享用。"
    ],
    tips: "煎前彻底吸干水分+大火高温封边+出锅静置醒肉5分钟，肉汁紧锁在内部粉嫩多汁。",
    image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  },

  // 45. 香煎三文鱼
  {
    id: "recipe_pan_seared_salmon",
    dish_name: "香煎三文鱼",
    category: "优质Omega-3",
    cooking_time_min: 8,
    prep_time_min: 3,
    difficulty: "新手友好",
    calories: 260,
    protein_g: 32.0,
    carbs_g: 0.8,
    fat_g: 14.5,
    fiber_g: 0.0,
    ingredients: [
      { name: "新鲜三文鱼排", amount: "180g" },
      { name: "海盐", amount: "2g" },
      { name: "现磨黑胡椒碎", amount: "2g" },
      { name: "新鲜柠檬片", amount: "2片" },
    ],
    steps: [
      "三文鱼用厨房纸吸干表面水分，鱼肉两面抹上海盐与现磨黑胡椒碎腌制3分钟。",
      "不粘平底锅中火加热，无需加油（三文鱼自含丰富健康鱼油），鱼皮朝下放入锅中。",
      "中火慢煎鱼皮面3分钟至鱼皮焦香酥脆金黄。",
      "翻面继续慢煎2分钟至鱼肉侧面变粉白（中心保持微微粉嫩）。",
      "出锅装盘，挤上几滴新鲜柠檬汁解腻提鲜。"
    ],
    tips: "利用三文鱼自身的深海鱼油干煎，鱼皮酥脆如脆片，富含优质Omega-3脂肪酸护心美肤。",
    image_url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
  },

  // 46. 菠菜猪肝汤
  {
    id: "recipe_spinach_pork_liver_soup",
    dish_name: "菠菜猪肝汤",
    category: "补铁靓汤",
    cooking_time_min: 8,
    prep_time_min: 10,
    difficulty: "简单家常",
    calories: 165,
    protein_g: 24.5,
    carbs_g: 5.5,
    fat_g: 4.8,
    fiber_g: 3.2,
    ingredients: [
      { name: "新鲜猪肝", amount: "150g" },
      { name: "菠菜", amount: "150g" },
      { name: "生姜丝", amount: "少许" },
      { name: "生抽", amount: "5ml" },
      { name: "淀粉", amount: "3g" },
      { name: "香油", amount: "2ml" },
    ],
    steps: [
      "猪肝切薄片清水多浸泡几遍冲去血水，加生抽、料酒、白胡椒粉、淀粉抓匀上浆。",
      "菠菜洗净沸水焯水30秒去除草酸捞出备用。",
      "锅中加水烧开，放入姜丝，大火下入上浆好的猪肝片快速划散烫煮1分钟至变色断生。",
      "放入焯好的菠菜煮沸半分钟，调入适量食盐和白胡椒粉。",
      "关火滴入少许香油即可出锅享用补铁好汤。"
    ],
    tips: "猪肝切薄片充分浸泡去血水，沸水快烫1分钟肉质最嫩滑不腥，是极佳的天然补铁食材。",
    image_url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
  },

  // 47. 鲜菇肉片汤
  {
    id: "recipe_fresh_mushroom_pork_soup",
    dish_name: "鲜菇肉片汤",
    category: "清鲜靓汤",
    cooking_time_min: 10,
    prep_time_min: 5,
    difficulty: "极速快手",
    calories: 175,
    protein_g: 22.0,
    carbs_g: 6.5,
    fat_g: 6.8,
    fiber_g: 2.8,
    ingredients: [
      { name: "瘦肉片", amount: "120g" },
      { name: "白玉菇/蟹味菇/海鲜菇", amount: "150g" },
      { name: "生姜丝/葱花", amount: "适量" },
      { name: "生抽", amount: "5ml" },
      { name: "食盐", amount: "2g" },
      { name: "白胡椒粉", amount: "1g" },
    ],
    steps: [
      "瘦肉切薄片加生抽、少许淀粉抓匀腌制；菌菇剪去根部洗净。",
      "锅内少许油下姜丝和菌菇煸炒1分钟析出鲜美菌汁。",
      "加入大碗开水大火烧沸煮3分钟使汤底清鲜醇厚。",
      "下入肉片快速划散，大火煮1-2分钟至肉片熟透飘起。",
      "加入适量盐、白胡椒粉调味，撒上葱花出锅装盘。"
    ],
    tips: "菌菇先用少许油煸炒一下能最大程度释放鲜味氨基酸，无需味精汤底自然鲜美无比。",
    image_url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
  },

  // 48. 海带排骨汤
  {
    id: "recipe_kelp_pork_ribs_soup",
    dish_name: "海带排骨汤",
    category: "滋补靓汤",
    cooking_time_min: 40,
    prep_time_min: 8,
    difficulty: "新手友好",
    calories: 245,
    protein_g: 23.5,
    carbs_g: 6.8,
    fat_g: 13.0,
    fiber_g: 3.5,
    ingredients: [
      { name: "猪肋排", amount: "200g" },
      { name: "鲜海带结/厚海带", amount: "150g" },
      { name: "生姜", amount: "4片" },
      { name: "料酒", amount: "10ml" },
      { name: "食盐", amount: "3g" },
    ],
    steps: [
      "排骨冷水下锅加姜片、料酒焯水，大沸后撇去浮沫捞出冲净。",
      "海带结洗净沥水备用。",
      "砂锅中加入足量清水，放入排骨和姜片大火烧开，转中小火慢炖25分钟。",
      "下入海带结继续炖煮12-15分钟至排骨软烂脱骨、海带软糯入味。",
      "出锅前加入适量食盐调味，撒上葱花即可大口喝汤吃肉。"
    ],
    tips: "海带自带天然海味鲜碘，与排骨油脂慢炖融合成醇香清润的滋补好汤。",
    image_url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
  },

  // 49. 冬瓜鸡肉丸子汤
  {
    id: "recipe_winter_melon_chicken_meatball_soup",
    dish_name: "冬瓜鸡肉丸子汤",
    category: "极速低卡高蛋白",
    cooking_time_min: 12,
    prep_time_min: 8,
    difficulty: "简单家常",
    calories: 185,
    protein_g: 28.0,
    carbs_g: 7.2,
    fat_g: 4.5,
    fiber_g: 2.8,
    ingredients: [
      { name: "鸡胸肉泥", amount: "200g" },
      { name: "冬瓜", amount: "250g (切薄片)" },
      { name: "葱姜末", amount: "少许" },
      { name: "生抽", amount: "8ml" },
      { name: "淀粉", amount: "5g" },
      { name: "食盐", amount: "2g" },
    ],
    steps: [
      "鸡胸肉剁成细泥，加葱姜水、生抽、少许盐、黑胡椒和淀粉顺一个方向搅打上劲起胶。",
      "锅中加足量清水烧至微开（锅底冒小泡状态）。",
      "用虎口挤出鸡肉丸子或用小勺舀入锅中，丸子浮起后捞去表面浮沫。",
      "下入切好的冬瓜薄片，中火继续煮3-4分钟至冬瓜呈半透明状软糯。",
      "调入少许盐、白胡椒粉和葱花出锅享用。"
    ],
    tips: "鸡肉泥顺一个方向搅打上劲，温水下丸子不易散，丸子紧实弹牙、冬瓜清甜刮油。",
    image_url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
  },

  // 50. 凉拌木耳
  {
    id: "recipe_chilled_black_fungus",
    dish_name: "凉拌木耳",
    category: "刮油凉菜",
    cooking_time_min: 5,
    prep_time_min: 4,
    difficulty: "极速快手",
    calories: 70,
    protein_g: 3.2,
    carbs_g: 8.5,
    fat_g: 2.5,
    fiber_g: 5.5,
    ingredients: [
      { name: "优质黑木耳 (泡发洗净)", amount: "150g" },
      { name: "大蒜", amount: "3瓣 (压蒜泥)" },
      { name: "香醋/陈醋", amount: "12ml" },
      { name: "生抽", amount: "8ml" },
      { name: "香油", amount: "3ml" },
      { name: "香菜/小米辣", amount: "适量" },
    ],
    steps: [
      "泡发好的木耳摘去硬根撕成小朵，沸水焯烫1.5分钟捞出，立刻投入冰水中过凉控干。",
      "大碗中加入蒜泥、生抽、香醋、少许盐和代糖提鲜、香油拌匀成料汁。",
      "将冰镇爽脆的木耳倒入大碗中，撒上香菜段和小米辣碎。",
      "充分抓拌均匀，冷藏几分钟后更加入味酸爽。"
    ],
    tips: "焯水后立刻冰镇过凉能让木耳恢复极度爽脆有嚼劲的口感，高膳食纤维清肠刮油。",
    image_url: "https://images.unsplash.com/photo-1607301406259-dfb186e15de8?auto=format&fit=crop&w=800&q=80",
  },

  // 51. 蒜蓉油麦菜
  {
    id: "recipe_garlic_youmaicai",
    dish_name: "蒜蓉油麦菜",
    category: "清爽素菜",
    cooking_time_min: 5,
    prep_time_min: 3,
    difficulty: "极速快手",
    calories: 80,
    protein_g: 3.5,
    carbs_g: 5.5,
    fat_g: 4.5,
    fiber_g: 3.8,
    ingredients: [
      { name: "鲜嫩油麦菜", amount: "300g" },
      { name: "大蒜", amount: "4瓣 (切蒜末)" },
      { name: "食用油", amount: "5ml" },
      { name: "食盐", amount: "2g" },
      { name: "蚝油", amount: "5ml" },
    ],
    steps: [
      "油麦菜洗净沥干水分，切成长段备用。",
      "热锅下油，下入大半蒜末小火煸炒出蒜香味。",
      "转大火倒入油麦菜快速翻炒至叶片变软呈翠绿色（约1分钟）。",
      "加入少许盐、蚝油和剩余生蒜末，快速翻匀出锅装盘。"
    ],
    tips: "大火快炒不可久留在锅中，保留油麦菜清脆甘润的天然特有蔬菜清香。",
    image_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
  },

  // 52. 孜然炒牛肉
  {
    id: "recipe_cumin_beef",
    dish_name: "孜然炒牛肉",
    category: "风味高蛋白",
    cooking_time_min: 8,
    prep_time_min: 6,
    difficulty: "简单家常",
    calories: 260,
    protein_g: 31.0,
    carbs_g: 5.0,
    fat_g: 12.0,
    fiber_g: 1.8,
    ingredients: [
      { name: "牛里脊肉", amount: "200g" },
      { name: "香菜段", amount: "1小把" },
      { name: "大蒜/洋葱丝", amount: "适量" },
      { name: "孜然粒 & 孜然粉", amount: "各3g" },
      { name: "生抽", amount: "10ml" },
      { name: "食用油", amount: "6ml" },
    ],
    steps: [
      "牛肉逆纹切薄片，加生抽、料酒、淀粉抓匀腌制5分钟。",
      "锅烧热下油，下牛肉片大火滑炒至8分熟变色盛出。",
      "锅中留底油炒香洋葱丝和蒜片，倒入孜然粒炒出烧烤般的浓郁孜然香气。",
      "倒回牛肉片大火快炒，撒入孜然粉和少许辣椒面翻炒均匀。",
      "关火撒入香菜段，利用余热颠锅两下即可出锅装盘。"
    ],
    tips: "孜然粒炒香+孜然粉裹味，最后关火加香菜快速颠锅，风味地道媲美烧烤牛肉。",
    image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
  },

  // 53. 蒜香鸡中翅轻油版
  {
    id: "recipe_garlic_chicken_wings",
    dish_name: "蒜香鸡中翅轻油版",
    category: "高蛋白硬菜",
    cooking_time_min: 15,
    prep_time_min: 10,
    difficulty: "新手友好",
    calories: 285,
    protein_g: 26.5,
    carbs_g: 4.5,
    fat_g: 16.5,
    fiber_g: 0.5,
    ingredients: [
      { name: "新鲜鸡中翅", amount: "6个 (约250g)" },
      { name: "大蒜", amount: "1头 (剁碎)" },
      { name: "生抽", amount: "12ml" },
      { name: "料酒", amount: "8ml" },
      { name: "黑胡椒", amount: "少许" },
    ],
    steps: [
      "鸡翅两面划两刀方便入味，加生抽、料酒、黑胡椒和一半蒜末抓匀腌制15分钟。",
      "平底锅小火预热刷极薄一层油，整齐摆入鸡翅。",
      "小火慢煎3-4分钟至底面金黄微焦，翻面继续小火煎3分钟。",
      "下入剩余一半蒜末一同翻炒出蒜香，加盖小火焖2分钟确保内部熟透骨肉分离。",
      "大火收汁至表皮金黄油亮焦香即可装盘。"
    ],
    tips: "鸡皮自带油脂，小火慢煎可逼出多余油脂，外皮焦脆蒜香浓郁，完全不油腻。",
    image_url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80",
  },

  // 54. 芹菜炒香干
  {
    id: "recipe_celery_dried_tofu",
    dish_name: "芹菜炒香干",
    category: "家常高纤素菜",
    cooking_time_min: 6,
    prep_time_min: 4,
    difficulty: "极速快手",
    calories: 145,
    protein_g: 11.5,
    carbs_g: 8.5,
    fat_g: 6.8,
    fiber_g: 4.0,
    ingredients: [
      { name: "香芹/西芹", amount: "200g (切段)" },
      { name: "卤香干/五香豆干", amount: "150g (切条)" },
      { name: "红椒丝", amount: "少许" },
      { name: "大蒜", amount: "2瓣" },
      { name: "生抽", amount: "8ml" },
      { name: "食用油", amount: "5ml" },
    ],
    steps: [
      "香芹洗净切寸段，香干切薄条，大蒜切片备用。",
      "热锅下油爆香蒜片，先下香干条中火煸炒1分钟至边缘微微金黄焦香。",
      "倒入芹菜段和红椒丝大火快速翻炒1-2分钟至芹菜断生保持脆绿。",
      "调入生抽和少许盐翻炒均匀即可出锅装盘。"
    ],
    tips: "香干先煸炒出豆香焦香，再下芹菜大火快炒，芹香浓郁干香适口。",
    image_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
  },

  // 55. 番茄虾仁滑蛋
  {
    id: "recipe_tomato_shrimp_eggs",
    dish_name: "番茄虾仁滑蛋",
    category: "高蛋白低卡",
    cooking_time_min: 10,
    prep_time_min: 5,
    difficulty: "极速快手",
    calories: 225,
    protein_g: 22.5,
    carbs_g: 9.0,
    fat_g: 10.5,
    fiber_g: 2.2,
    ingredients: [
      { name: "大虾仁", amount: "120g" },
      { name: "新鲜鸡蛋", amount: "2个" },
      { name: "熟透番茄", amount: "1个 (切小块)" },
      { name: "香葱", amount: "1根" },
      { name: "生抽/盐", amount: "适量" },
      { name: "食用油", amount: "6ml" },
    ],
    steps: [
      "虾仁加少许料酒、黑胡椒腌制；鸡蛋打散加少许牛奶和盐打匀。",
      "锅中热少许油倒入虾仁煎至变红8分熟，倒入蛋液推炒成嫩滑大块盛出。",
      "锅底少油倒入番茄块大火炒出浓稠红汁。",
      "倒回虾仁滑蛋块翻炒均匀裹汁，撒上葱花即可出锅。"
    ],
    tips: "番茄浓郁果汁与虾仁鲜甜、滑蛋软嫩三重结合，高蛋白低脂肪，减脂期超级治愈。",
    image_url: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80",
  },
];

// Fuzzy recipe finder
export function getPredefinedRecipe(dishName: string): RecipeData | null {
  if (!dishName) return null;
  const clean = dishName.trim().toLowerCase();

  // 1. Exact match
  const exact = AUTHENTIC_RECIPES.find((r) => r.dish_name.toLowerCase() === clean);
  if (exact) return exact;

  // 2. Includes match
  const matched = AUTHENTIC_RECIPES.find(
    (r) => clean.includes(r.dish_name.toLowerCase()) || r.dish_name.toLowerCase().includes(clean)
  );
  if (matched) return matched;

  // 3. Keyword combinations
  if (clean.includes("番茄") && (clean.includes("蛋") || clean.includes("鸡蛋"))) {
    return (
      AUTHENTIC_RECIPES.find((r) => r.dish_name === (clean.includes("面") ? "西红柿鸡蛋面" : clean.includes("虾") ? "番茄虾仁滑蛋" : "番茄炒蛋")) ||
      AUTHENTIC_RECIPES[0]
    );
  }
  if (clean.includes("鸡胸") || (clean.includes("鸡") && clean.includes("煎"))) {
    return AUTHENTIC_RECIPES.find((r) => r.dish_name === "香煎鸡胸肉") || null;
  }
  if (clean.includes("牛肉") || clean.includes("牛排")) {
    if (clean.includes("黑椒") && clean.includes("排")) return AUTHENTIC_RECIPES.find((r) => r.dish_name === "无油黑椒牛排") || null;
    if (clean.includes("洋葱")) return AUTHENTIC_RECIPES.find((r) => r.dish_name === "牛肉炒洋葱") || null;
    if (clean.includes("水煮")) return AUTHENTIC_RECIPES.find((r) => r.dish_name === "水煮牛肉轻卡版") || null;
    if (clean.includes("酸汤") || clean.includes("肥牛")) return AUTHENTIC_RECIPES.find((r) => r.dish_name.includes("肥牛")) || null;
    return AUTHENTIC_RECIPES.find((r) => r.dish_name.includes("牛肉")) || null;
  }
  if (clean.includes("虾") || clean.includes("虾仁")) {
    if (clean.includes("荷兰豆")) return AUTHENTIC_RECIPES.find((r) => r.dish_name === "荷兰豆炒虾仁") || null;
    if (clean.includes("西兰花")) return AUTHENTIC_RECIPES.find((r) => r.dish_name === "西兰花炒虾仁") || null;
    if (clean.includes("白灼")) return AUTHENTIC_RECIPES.find((r) => r.dish_name === "白灼虾") || null;
    return AUTHENTIC_RECIPES.find((r) => r.dish_name.includes("虾")) || null;
  }
  if (clean.includes("西兰花")) {
    return AUTHENTIC_RECIPES.find((r) => r.dish_name.includes("西兰花")) || null;
  }
  if (clean.includes("豆腐")) {
    if (clean.includes("麻婆")) return AUTHENTIC_RECIPES.find((r) => r.dish_name === "麻婆豆腐") || null;
    if (clean.includes("红烧")) return AUTHENTIC_RECIPES.find((r) => r.dish_name === "红烧豆腐") || null;
    return AUTHENTIC_RECIPES.find((r) => r.dish_name.includes("豆腐")) || null;
  }
  if (clean.includes("黄瓜")) {
    return AUTHENTIC_RECIPES.find((r) => r.dish_name.includes("黄瓜")) || null;
  }
  if (clean.includes("鱼") || clean.includes("鲈鱼")) {
    return AUTHENTIC_RECIPES.find((r) => r.dish_name.includes("清蒸鱼") || r.dish_name.includes("清蒸鲈鱼")) || null;
  }

  return null;
}
