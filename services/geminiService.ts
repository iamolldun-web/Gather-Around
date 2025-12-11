
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Story, StoryPage } from "../types";
import { getCachedImage, cacheImage } from "./offlineService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// The user-provided background image style reference
export const BACKGROUND_IMAGE_URL = "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=3540&auto=format&fit=crop";

const PAPER_CUT_STYLE_PROMPT = `
  Style: Colorful, intricate 3D layered paper-cut art.
  Palette: Rich, vibrant, and saturated colors specifically matching the region's traditional art style.
  Technique: Digital collage imitating physical paper layers. Strong visible drop shadows between layers to create deep depth.
  Mood: Whimsical, folkloric, inviting and magical.
  Constraint: Do not use photorealism. It must look like a handcrafted paper illustration.
`;

// --- STATIC CONTENT DATABASE (60 Stories) ---
const STATIC_STORY_CONTENT: Record<string, StoryPage[]> = {
  "1": [
    {
      text: "One bright day, Anansi the Spider found a funny-looking rock covered in soft green moss. When anyone said the magic words near it, they suddenly fell fast asleep! Anansi’s eyes sparkled—he loved tricks, and this rock was perfect.",
      visualDescription: "Ghanaian paper art. Anansi the spider looking at a strange moss-covered rock in a sunny forest clearing.",
      historyFact: "The Akan people of Ghana tell stories through “griots,” special storytellers who pass tales from generation to generation."
    },
    {
      text: "Anansi invited the animals for walks and led them right to the rock. “Isn’t this a strange moss-covered rock?” they would say—then THUD! They fell asleep! While they snored, Anansi grabbed their food and ran off giggling.",
      visualDescription: "Ghanaian paper art. Forest animals sleeping around a rock while Anansi sneaks away with a basket of fruit.",
      historyFact: "Trickster tales teach that being clever can help—but using tricks for bad causes trouble."
    },
    {
      text: "Little Deer noticed the pattern. She peeked from behind a tree and saw Anansi do the same trick again and again. She nodded wisely. “Time to stop him,” she whispered.",
      visualDescription: "Ghanaian paper art. A small deer peeking from behind a large baobab tree watching Anansi.",
      historyFact: "In West African stories, deer often represent wisdom and sharp thinking."
    },
    {
      text: "The next day, Little Deer followed Anansi but pretended not to notice the special rock. “Say the magic words!” Anansi urged. Instead, she made him say them. “Isn’t this a strange moss-covered rock?” he said—and BOOM! Anansi fell asleep!",
      visualDescription: "Ghanaian paper art. Anansi falling asleep next to the rock while the Deer looks on calmly.",
      historyFact: "Many Ghanaian tales celebrate clever justice instead of fighting."
    },
    {
      text: "While Anansi slept, the animals took their food back and shared a big meal together. When Anansi woke up, he realized he’d been outsmarted—and that greed never wins.",
      visualDescription: "Ghanaian paper art. Animals sharing a feast in the forest while Anansi wakes up confused in the distance.",
      historyFact: "Anansi stories traveled with the African diaspora and are still loved worldwide."
    }
  ],
  "2": [
    {
      text: "Long ago, Sun and Moon lived on Earth. Sun invited his friend Water to visit, but Water said, “I come with many creatures! Your home must be big enough for all of us.”",
      visualDescription: "Nigerian paper art. The Sun and Moon characters standing on earth talking to a waving body of Water.",
      historyFact: "Nigerian coastal communities have deep traditions about rivers and seas."
    },
    {
      text: "Sun and Moon worked hard to build a large, sturdy house. They raised the roof high and widened the rooms so Water and all his sea animals could fit.",
      visualDescription: "Nigerian paper art. Sun and Moon building a large African mud-brick house with a tall roof.",
      historyFact: "Traditional Nigerian homes made of mud and thatch stay cool during hot days."
    },
    {
      text: "When Water came, he brought waves, fish, crabs, and sea creatures of every size. Water poured into the house so fast that Sun and Moon had to stand on tiptoes!",
      visualDescription: "Nigerian paper art. Water flooding into the house filled with colorful fish and crabs.",
      historyFact: "West African stories often use nature spirits to explain the world around us."
    },
    {
      text: "The water kept rising. Sun and Moon climbed onto the roof—then, to stay safe, they leapt up into the sky. There they found a peaceful new home.",
      visualDescription: "Nigerian paper art. Sun and Moon leaping from a rooftop into the starry sky.",
      historyFact: "African origin stories creatively explain how natural things came to be."
    },
    {
      text: "Sun shines bright by day, and Moon glows softly at night. From the sky, they look down kindly on Water below.",
      visualDescription: "Nigerian paper art. The Sun shining in the day sky and the Moon in the night sky over the ocean.",
      historyFact: "Many Nigerian tales feature celestial beings who shape Earth’s harmony."
    }
  ],
  "3": [
    {
      text: "Jackal was trotting through the grasslands when Lion stepped out and growled, “I’m hungry, Jackal.” Jackal gulped—but his quick mind kept working.",
      visualDescription: "South African paper art. A clever Jackal facing a large, imposing Lion in the grasslands.",
      historyFact: "The San people tell some of the world’s oldest animal stories."
    },
    {
      text: "Jackal gasped and pointed upward. “Lion! The sky is falling!” he shouted. Lion looked up in panic as Jackal whispered, “We must hide or we’ll be crushed!”",
      visualDescription: "South African paper art. Jackal pointing frantically at the sky while Lion looks up in fear.",
      historyFact: "San tales often include sky mysteries inspired by open, star-filled skies."
    },
    {
      text: "Lion, frightened, asked where to go. Jackal pointed to some faraway rocks. “Let me check them first,” he said quickly. Lion stepped aside so Jackal could “lead.”",
      visualDescription: "South African paper art. Jackal pointing towards distant rocks while Lion cowers.",
      historyFact: "Rocky hills appear often in San tales as safe hiding places."
    },
    {
      text: "The moment he was free, Jackal dashed away zigzagging through the plains. By the time Lion realized there was no falling sky, Jackal was long gone.",
      visualDescription: "South African paper art. Jackal running fast through the savanna leaving a confused Lion behind.",
      historyFact: "Many San stories show how clever thinking defeats brute force."
    },
    {
      text: "Jackal curled up safely in his den. He knew bravery didn’t always mean fighting—it meant thinking fast in scary moments.",
      visualDescription: "South African paper art. Jackal resting peacefully in a cozy den.",
      historyFact: "San folklore teaches lessons about survival, community, and wisdom."
    }
  ],
  "4": [
    {
      text: "Hiwot wanted her new stepson to feel loved, but he kept his distance. A wise healer told her she needed a whisker from a living lion to begin the magic of bonding.",
      visualDescription: "Ethiopian paper art. A woman talking to an old wise healer in a village setting.",
      historyFact: "Ethiopia has many cultures, each rich in folktales."
    },
    {
      text: "Each night, Hiwot placed meat gently near a lion’s cave. She never rushed him—she simply showed patience and respect.",
      visualDescription: "Ethiopian paper art. A woman placing a bowl of food near a cave entrance at dusk.",
      historyFact: "Lions symbolize courage and royalty in Ethiopian tradition."
    },
    {
      text: "Slowly, the lion came closer. One peaceful morning, he allowed her to touch his mane. Carefully, she plucked a single whisker.",
      visualDescription: "Ethiopian paper art. A woman gently touching a lion's mane and taking a whisker.",
      historyFact: "Ethiopian stories often praise patience and steady effort."
    },
    {
      text: "When Hiwot brought the whisker to the healer, the healer smiled. “You already learned what you need,” she said. “Love grows with time and gentle care—just like with the lion.”",
      visualDescription: "Ethiopian paper art. The healer holding the whisker and smiling at the woman.",
      historyFact: "Symbolic tasks often appear in Ethiopian tales to teach deeper truths."
    },
    {
      text: "Hiwot returned home and showed her stepson the same patience she had shown the lion. Soon, they formed a warm, loving bond.",
      visualDescription: "Ethiopian paper art. The woman and a young boy sitting together happily.",
      historyFact: "Ethiopian wisdom teaches that true connection starts with empathy."
    }
  ],
  "5": [
    {
      text: "Hare bragged loudly, “I’m the strongest animal of all!” Elephant laughed and challenged him to a test of strength.",
      visualDescription: "Kenyan paper art. A small Hare looking up confidently at a giant Elephant.",
      historyFact: "Kenya’s savannas are home to elephants, zebras, lions, and more."
    },
    {
      text: "Hare tied Elephant’s rope to one end of a vine. Then he sneaked across the river and tied the other end to Hippo without either giant animal noticing.",
      visualDescription: "Kenyan paper art. Hare tying a vine to a Hippo in the river, unseen by the Elephant.",
      historyFact: "Elephants and hippos rarely meet—perfect for a silly trick!"
    },
    {
      text: "Elephant pulled hard. Hippo pulled hard. Each thought Hare was pulling on the other side! They panted and strained, amazed at Hare’s “strength.”",
      visualDescription: "Kenyan paper art. Elephant pulling a rope on land and Hippo pulling in the water, both straining.",
      historyFact: "Trickster hares in East Africa often use brains, not muscle."
    },
    {
      text: "When Elephant and Hippo finally saw each other, they knew Hare had fooled them. Hare giggled from far away—just out of reach.",
      visualDescription: "Kenyan paper art. Elephant and Hippo looking at each other confused while Hare laughs in the distance.",
      historyFact: "Swahili folktales use humor to show why pride can be silly."
    },
    {
      text: "Everyone agreed that Hare wasn’t the strongest—but he was definitely the trickiest. And strength isn’t everything.",
      visualDescription: "Kenyan paper art. Hare sitting proudly while other animals look on with respect.",
      historyFact: "Kenyan stories often end with reminders about community and humility."
    }
  ],
  "6": [
    {
      text: "A kind king gave a young man a magical drum. When played gently, it made delicious food appear to feed the whole village.",
      visualDescription: "Yoruba paper art. A young man playing a decorated drum with food appearing around him.",
      historyFact: "Drums are sacred in Yoruba culture and used in celebrations."
    },
    {
      text: "A neighbor stole the drum, dreaming of keeping all its magic for himself. He beat the drum loudly, expecting mountains of food.",
      visualDescription: "Yoruba paper art. A greedy man stealing the drum and running away.",
      historyFact: "Yoruba tales warn strongly against greed, called ije."
    },
    {
      text: "Instead of helpful magic, chaos burst out—flying food, running animals, shaking walls! The drum knew he was selfish.",
      visualDescription: "Yoruba paper art. Chaos in a hut with objects flying and animals running wild.",
      historyFact: "Enchanted objects in Yoruba stories often act like characters."
    },
    {
      text: "The king took back the drum and reminded the village that magic only works for those with generous hearts.",
      visualDescription: "Yoruba paper art. The King holding the drum and speaking to the villagers.",
      historyFact: "Yoruba folktales reward kindness and balance."
    },
    {
      text: "With the drum returned, it once again filled the village with food, joy, and togetherness.",
      visualDescription: "Yoruba paper art. A happy village feast with the drum in the center.",
      historyFact: "Yoruba culture teaches harmony between people and the spirit world."
    }
  ],
  "7": [
    {
      text: "Long ago, the sky hung low—so low people could touch it and even slice off little pieces to cook when food was scarce.",
      visualDescription: "Nigerian paper art. People reaching up and touching a low-hanging sky.",
      historyFact: "Many Nigerian stories connect food and nature closely."
    },
    {
      text: "But people became greedy. They took more sky-food than they needed and left scraps everywhere.",
      visualDescription: "Nigerian paper art. People wasting food and throwing pieces of the sky on the ground.",
      historyFact: "Nigerian proverbs warn against wasting precious resources."
    },
    {
      text: "The sky rumbled sadly. “Please stop wasting me,” it seemed to say. But people didn’t listen.",
      visualDescription: "Nigerian paper art. Dark clouds forming a sad face in the sky.",
      historyFact: "In West African myths, the sky is often alive with feelings."
    },
    {
      text: "The sky slowly lifted itself up, higher and higher, until no one could reach it anymore.",
      visualDescription: "Nigerian paper art. The sky moving far up away from the people on the ground.",
      historyFact: "Folktales often explain natural limits through dramatic changes."
    },
    {
      text: "People looked up and remembered to cherish what they once took for granted.",
      visualDescription: "Nigerian paper art. People looking up wistfully at the distant blue sky.",
      historyFact: "Many Nigerian stories teach gratitude and respect."
    }
  ],
  "8": [
    {
      text: "Tortoise begged the birds to take him to their feast in the sky. They agreed and gave him feathers to make beautiful wings.",
      visualDescription: "Igbo paper art. A Tortoise attaching feathers to his shell to make wings.",
      historyFact: "Igbo masquerade costumes often inspire story characters."
    },
    {
      text: "Tortoise soared with the birds, amazed at the tiny world below. But at the feast, he announced he should eat first because he was “the wisest.”",
      visualDescription: "Igbo paper art. Tortoise flying in the sky with a flock of birds.",
      historyFact: "Tortoise often appears as a clever—but selfish—trickster."
    },
    {
      text: "Tortoise gobbled everything. The angry birds took back their feathers, leaving him unable to fly home.",
      visualDescription: "Igbo paper art. Angry birds taking their feathers back from the Tortoise.",
      historyFact: "Feasts in Igbo culture represent sharing and unity."
    },
    {
      text: "Without feathers, Tortoise fell from the sky and crashed onto the earth, cracking his shell into pieces.",
      visualDescription: "Igbo paper art. Tortoise falling through the air towards the ground.",
      historyFact: "This tale explains why tortoise shells look patchy."
    },
    {
      text: "His shell healed, but the cracks stayed forever—a reminder that selfishness hurts everyone, even yourself.",
      visualDescription: "Igbo paper art. Tortoise walking away with a cracked pattern on his shell.",
      historyFact: "Igbo stories often explain natural traits through magical events."
    }
  ],
  "9": [
    {
      text: "A terrible drought dried the fields. Animals grew weak. A brave girl named Lindiwe decided she must help.",
      visualDescription: "Zulu paper art. A young girl looking at dry, cracked earth and wilted plants.",
      historyFact: "Zulu tales often highlight courage and leadership."
    },
    {
      text: "Lindiwe climbed the tallest mountain to talk to the sky spirits, carrying only hope in her heart.",
      visualDescription: "Zulu paper art. The girl climbing a steep, rocky mountain path.",
      historyFact: "Mountains hold deep spiritual meaning in Zulu culture."
    },
    {
      text: "At the top, she sang with all her strength, asking the spirits to save her people. Her voice echoed into the clouds.",
      visualDescription: "Zulu paper art. The girl singing at the mountain peak with arms raised.",
      historyFact: "Music is central to Zulu ceremony and storytelling."
    },
    {
      text: "Moved by her bravery, the spirits gathered dark clouds and opened the skies. Rain began to fall!",
      visualDescription: "Zulu paper art. Rain clouds gathering and rain starting to fall on the mountain.",
      historyFact: "Rain symbolizes blessing and renewal in Southern Africa."
    },
    {
      text: "Water filled the rivers and fields grew green again. Lindiwe returned as a hero whose kindness saved her village.",
      visualDescription: "Zulu paper art. Green fields and flowing rivers with happy villagers welcoming the girl.",
      historyFact: "Zulu legends celebrate those who act for the greater good."
    }
  ],
  "10": [
    {
      text: "Kalulu the Hare was fast—and proud of it! He challenged Leopard to a race, saying speed mattered more than strength.",
      visualDescription: "Tanzanian paper art. A Hare talking confidently to a spotted Leopard.",
      historyFact: "Hare stories spread across East Africa as symbols of cleverness."
    },
    {
      text: "Leopard agreed, sure he would win. But Kalulu had a plan: a shortcut through tall grass known only to him.",
      visualDescription: "Tanzanian paper art. Leopard stretching his legs while Hare looks at a path in the tall grass.",
      historyFact: "Tall savanna grass is home to many quick, small animals."
    },
    {
      text: "Leopard sprinted straight ahead, powerful and swift. Kalulu darted into the grass and zipped along his secret path.",
      visualDescription: "Tanzanian paper art. Leopard running fast on a track while Hare zips through the grass side.",
      historyFact: "Many East African tales show animals navigating landscapes cleverly."
    },
    {
      text: "Panting heavily, Leopard reached the finish line—only to find Kalulu waiting there with a grin.",
      visualDescription: "Tanzanian paper art. Leopard arriving tired at the finish line where Hare is already waiting.",
      historyFact: "Trickster hares use brains to balance power differences in stories."
    },
    {
      text: "Leopard bowed in defeat. Kalulu realized that being clever was good—but boasting wasn't.",
      visualDescription: "Tanzanian paper art. Leopard and Hare shaking hands (or paws) respectfully.",
      historyFact: "East African stories often end with lessons about wisdom and humility."
    }
  ],
  "11": [
    { text: "In a peaceful Greek village, a shepherd boy watched sheep all day. Feeling bored, he shouted, “Wolf! Wolf!” just to make the villagers run up the hill. When they arrived, he burst into laughter.", visualDescription: "Greek paper art. A shepherd boy on a hill laughing while villagers run up.", historyFact: "Many Greek fables come from Aesop, a wise storyteller from ancient Greece." },
    { text: "The next day, he played the same trick. Again, the villagers hurried to help. Again, he laughed at them.", visualDescription: "Greek paper art. Villagers looking annoyed at the laughing boy.", historyFact: "Greek villages were often built on hillsides to watch over farms and animals." },
    { text: "That evening, a real wolf crept toward the sheep. Terrified, the boy shouted, “Wolf! Wolf! Please help!”", visualDescription: "Greek paper art. A dark wolf silhouette creeping towards sheep at dusk.", historyFact: "Long ago, wolves wandered freely across Greece." },
    { text: "This time the villagers stayed home. “He’s joking again,” they said. The wolf chased the sheep while the boy cried helplessly.", visualDescription: "Greek paper art. The boy crying alone on the hill while the wolf chases sheep.", historyFact: "Greek fables often teach lessons through simple but powerful events." },
    { text: "When the villagers finally checked, the sheep were gone. The boy realized that honesty is the only way people can trust you.", visualDescription: "Greek paper art. The boy looking sad and regretful with the villagers.", historyFact: "Many Greek stories remind children that truth builds strong communities." }
  ],
  "12": [
    { text: "An old donkey, tired of being mistreated, left home to travel to Bremen and become a musician. On his journey, he met a worn-out dog who wished for a happier life too.", visualDescription: "German paper art. A donkey and a dog walking together on a road.", historyFact: "Bremen is a real German city famous for trade and storytelling." },
    { text: "They soon met a cat who couldn’t hunt anymore and a rooster who ran away before he became dinner. Together, they decided to form a band.", visualDescription: "German paper art. A donkey, dog, cat, and rooster standing together.", historyFact: "German folktales often feature animal friends who team up." },
    { text: "As they traveled, they saw a cabin filled with robbers. Cold and hungry, the animals stacked themselves up and let out a loud “musical” scream!", visualDescription: "German paper art. Animals stacked on top of each other looking into a cabin window.", historyFact: "Many German tales take place in dark, mysterious forests." },
    { text: "The robbers thought a giant monster was attacking and ran away in fear. The animals went inside, lit the fire, and enjoyed a warm feast.", visualDescription: "German paper art. Robbers running away from the cabin in the dark woods.", historyFact: "The Brothers Grimm collected many famous German stories like this one." },
    { text: "The four friends loved the cozy cabin so much that they stayed forever. They didn’t need to reach Bremen after all—they already had everything they wanted.", visualDescription: "German paper art. The four animals resting happily inside a warm cabin.", historyFact: "A statue of the Bremen Town Musicians still stands in Bremen today." }
  ],
  "13": [
    { text: "A kind girl named Red Riding Hood walked through a French forest carrying bread and butter for her grandmother.", visualDescription: "French paper art. Little Red Riding Hood walking through a forest with a basket.", historyFact: "In old France, families often lived close enough for daily visits." },
    { text: "Along the path, she met a sneaky wolf who asked where she was going. Trusting him, she told him everything—never guessing he planned a trick.", visualDescription: "French paper art. Red Riding Hood talking to a wolf in the woods.", historyFact: "Wolves once lived throughout France, inspiring many stories." },
    { text: "The wolf rushed ahead, reached Grandmother’s cottage, and disguised himself under her blankets, pretending to be her.", visualDescription: "French paper art. The wolf in a bonnet getting into a bed in a cottage.", historyFact: "Many French cottages were small, warm homes with stone fireplaces." },
    { text: "When Red Riding Hood arrived, she felt something strange. As she questioned “Grandmother,” the wolf leapt from the bed—but a woodsman nearby rushed in and saved them.", visualDescription: "French paper art. A woodsman bursting into the cottage to save Red Riding Hood.", historyFact: "Woodsmen were common in old French forests." },
    { text: "Red Riding Hood promised to be more careful and never share too much with strangers again.", visualDescription: "French paper art. Red Riding Hood safe with her grandmother.", historyFact: "French tales often teach caution through gentle, memorable adventures." }
  ],
  "14": [
    { text: "An old woman baked a gingerbread man, but as soon as she opened the oven, he leapt out shouting, “Run, run, as fast as you can!”", visualDescription: "English paper art. A gingerbread man jumping out of an oven.", historyFact: "Gingerbread has been a favorite treat in England since medieval times." },
    { text: "He outran the old woman, the old man, a cow, and a horse—none could catch him.", visualDescription: "English paper art. The gingerbread man running down a road chased by people and animals.", historyFact: "England’s winding country roads inspired many chase stories." },
    { text: "At a river, the gingerbread man met a clever fox who offered a ride across the water.", visualDescription: "English paper art. The gingerbread man stopping at a river with a fox nearby.", historyFact: "Foxes appear in many British tales as playful tricksters." },
    { text: "As the water rose, the fox told the gingerbread man to climb onto his back, then neck, then nose—until suddenly the fox flipped his head and snapped him up.", visualDescription: "English paper art. The gingerbread man on the fox's nose in the river.", historyFact: "English folktales often end with surprising, funny twists." },
    { text: "The villagers remembered: when someone seems too helpful, they may have a trick of their own.", visualDescription: "English paper art. Villagers talking by the riverbank.", historyFact: "Many English stories mix humor with simple moral lessons." }
  ],
  "15": [
    { text: "Best friends Gerda and Kai were inseparable—until one winter day when a magic ice shard slipped into Kai’s eye and froze his heart.", visualDescription: "Danish paper art. A boy and girl playing in the snow, the boy looking pained.", historyFact: "Denmark’s long, snowy winters inspired many magical tales." },
    { text: "The Snow Queen appeared and whisked Kai away to her sparkling palace made entirely of frost and mirrors.", visualDescription: "Danish paper art. The Snow Queen in a sleigh taking the boy away.", historyFact: "Danish folklore includes winter spirits and snow beings." },
    { text: "Gerda refused to give up. She traveled through forests, rivers, and snow to find her friend.", visualDescription: "Danish paper art. A girl walking determinedly through a snowy landscape.", historyFact: "Denmark has many rivers and waterways that appear in stories." },
    { text: "When Gerda finally found Kai, her warm tears melted the ice in his eye and heart.", visualDescription: "Danish paper art. The girl hugging the boy in an ice palace.", historyFact: "Love and friendship are powerful themes in Danish storytelling." },
    { text: "Hand in hand, they returned home, warmer and closer than ever.", visualDescription: "Danish paper art. The boy and girl walking home holding hands.", historyFact: "Hans Christian Andersen wrote the original Snow Queen story." }
  ],
  "16": [
    { text: "Every morning, the king found his twelve daughters’ shoes worn out—even though their bedroom door stayed locked.", visualDescription: "German paper art. A King looking at worn out shoes in a royal bedroom.", historyFact: "Castles and royal puzzles appear often in German folklore." },
    { text: "A kind young soldier accepted the king’s challenge to discover the princesses’ secret.", visualDescription: "German paper art. A soldier bowing before a King.", historyFact: "German tales often reward courage from everyday people." },
    { text: "With magical help, the soldier followed the princesses into a secret underground kingdom filled with sparkling trees and glowing lakes.", visualDescription: "German paper art. Princesses walking through a magical underground forest with silver trees.", historyFact: "Hidden underground worlds appear in many German myths." },
    { text: "There, the princesses danced all night with twelve enchanted princes.", visualDescription: "German paper art. Twelve princesses dancing in a grand hall.", historyFact: "Dance traditions are deeply rooted in German culture." },
    { text: "The soldier gently revealed what he saw. The spell was broken, and the king thanked him for solving the mystery.", visualDescription: "German paper art. The soldier presenting the worn shoes to the King.", historyFact: "Many Grimm tales break enchantments through honesty or bravery." }
  ],
  "17": [
    { text: "One stormy night, a girl knocked on the castle door saying she was a princess needing shelter.", visualDescription: "Danish paper art. A girl standing at a castle door in the rain.", historyFact: "Denmark’s coasts bring strong ocean storms." },
    { text: "The queen tested her by placing a tiny pea under twenty mattresses and twenty feather beds.", visualDescription: "Danish paper art. A very tall bed with many mattresses.", historyFact: "Danish bedding often used soft feathers." },
    { text: "The next morning, the girl said she hadn’t slept at all because something lumpy hurt her back.", visualDescription: "Danish paper art. The girl climbing down a ladder from the tall bed.", historyFact: "In Danish stories, sensitivity is seen as a royal trait." },
    { text: "Only a real princess could feel such a small pea through so many layers, the queen declared happily.", visualDescription: "Danish paper art. The Queen smiling at the girl.", historyFact: "Royal tests appear in many European fairy tales." },
    { text: "The prince married her, and the pea was placed in a museum for everyone to see.", visualDescription: "Danish paper art. A tiny pea on a velvet cushion.", historyFact: "Andersen’s tales often include gentle humor and imagination." }
  ],
  "18": [
    { text: "A poor fisherman caught a talking fish who begged to be freed. The kind fisherman let him go.", visualDescription: "German paper art. A fisherman in a boat talking to a large fish.", historyFact: "German rivers like the Rhine appear in many old legends." },
    { text: "His wife told him to ask the fish for a bigger home. The fish granted the wish.", visualDescription: "German paper art. A nice cottage appearing where a hut used to be.", historyFact: "Wishes in German stories often come with warnings." },
    { text: "But the wife wanted more: a castle, a kingdom, even control of the sun and moon.", visualDescription: "German paper art. A woman demanding things in a grand castle.", historyFact: "Many European tales warn against being greedy." },
    { text: "Finally, the fish became angry and took all the gifts back.", visualDescription: "German paper art. The sea becoming stormy and dark.", historyFact: "Water spirits in German folklore often punish excess." },
    { text: "The fisherman and his wife returned to their tiny hut, realizing too much wanting brings no happiness.", visualDescription: "German paper art. The couple sitting in a small, poor hut.", historyFact: "Grimm tales often teach gentle lessons about being thankful." }
  ],
  "19": [
    { text: "Jack traded his family cow for magic beans. Overnight, they grew into a giant beanstalk reaching into the clouds.", visualDescription: "English paper art. A giant beanstalk growing up into the clouds from a cottage.", historyFact: "English countryside legends often include giants." },
    { text: "Jack climbed up and found a huge castle belonging to a fearsome giant.", visualDescription: "English paper art. Jack walking towards a giant castle in the clouds.", historyFact: "England’s hills inspired many “giant kingdom” myths." },
    { text: "Jack sneaked inside, taking a bag of gold, a singing harp, and a goose that laid golden eggs.", visualDescription: "English paper art. Jack sneaking away with a goose and a harp.", historyFact: "Harps were important instruments in old English music." },
    { text: "The giant chased Jack down the beanstalk. Jack chopped it down just in time, stopping the giant forever.", visualDescription: "English paper art. Jack chopping down the beanstalk with an axe.", historyFact: "Many English stories show heroes escaping danger with quick thinking." },
    { text: "With magical treasures, Jack and his mother lived happily and comfortably.", visualDescription: "English paper art. Jack and his mother smiling in a comfortable home.", historyFact: "English folktales often celebrate brave, humble heroes." }
  ],
  "20": [
    { text: "A fisherman spotted a selkie on the beach—a seal who can become a woman. Her seal skin lay beside her.", visualDescription: "Scottish paper art. A seal skin lying on a rocky beach.", historyFact: "Selkies come from ancient Scottish sea legends." },
    { text: "He hid her seal skin, hoping she would stay with him. She became his wife, though her heart stayed quiet and sad.", visualDescription: "Scottish paper art. A woman looking out at the sea from a cottage window.", historyFact: "Scottish tales often explore longing and freedom." },
    { text: "Although she was kind, the selkie gazed at the ocean every day, wishing to return to her true home.", visualDescription: "Scottish paper art. The woman standing on the shore looking at the waves.", historyFact: "Scotland’s islands depend heavily on the sea for life and stories." },
    { text: "One day, she found her hidden seal skin. She knew she had to return to the waves she loved.", visualDescription: "Scottish paper art. The woman finding the hidden seal skin.", historyFact: "Selkies symbolize the pull between two worlds—land and sea." },
    { text: "She slipped into the water, promising to watch over her family from afar, forever connected by love.", visualDescription: "Scottish paper art. A seal swimming away in the ocean waves.", historyFact: "Scottish folklore often mixes sadness with deep beauty." }
  ],
  "21": [
    { text: "Long ago, a gentle cowherd named Niulang met Zhinü, a beautiful weaver from the heavens. They fell in love instantly and created a peaceful, happy home together.", visualDescription: "Chinese paper art. A cowherd and a weaver girl sitting together under a tree.", historyFact: "This story is the origin of Qixi—China’s “Valentine’s Day.”" },
    { text: "But the Queen Mother of Heaven discovered their love and became angry. She pulled Zhinü back to the sky, separating the two forever.", visualDescription: "Chinese paper art. A heavenly queen pulling the weaver girl up to the clouds.", historyFact: "Chinese myths often include powerful heavenly queens or guardians." },
    { text: "Heartbroken, Niulang used a magical ox hide to fly toward the sky, hoping to reach Zhinü again.", visualDescription: "Chinese paper art. The cowherd flying on an ox hide towards the sky.", historyFact: "Oxen symbolize loyalty, patience, and strength in Chinese culture." },
    { text: "To keep them apart, the Queen Mother created a wide, glittering river in the sky—the Milky Way.", visualDescription: "Chinese paper art. A river of stars separating the couple in the sky.", historyFact: "In China, the Milky Way is called the “Silver River.”" },
    { text: "Touched by their devotion, magpies gather every year to form a bridge so the couple can meet for one special night.", visualDescription: "Chinese paper art. A bridge made of magpies across the stars.", historyFact: "Magpies represent joy, reunion, and love in Chinese folklore." }
  ],
  "22": [
    { text: "Sun Wukong, the Monkey King, was born from a magical stone. He grew strong, fast, and unbelievably clever—but also very mischievous!", visualDescription: "Chinese paper art. A monkey bursting out of a stone on a mountain.", historyFact: "He appears in one of China’s “Four Great Classical Novels.”" },
    { text: "He trained with wise sages, learning cloud-riding, shape-shifting, and powerful martial arts.", visualDescription: "Chinese paper art. The Monkey King practicing martial arts on a cloud.", historyFact: "Martial arts traditions have deep roots in Chinese legends." },
    { text: "His pride grew too big, and he caused chaos in the heavens. The Buddha finally trapped him under a mountain to teach him humility.", visualDescription: "Chinese paper art. A giant mountain trapping the Monkey King.", historyFact: "Buddhism shaped many Chinese stories and moral lessons." },
    { text: "Years later, he was freed to protect a monk traveling west to bring sacred scriptures home. Along the way, he battled demons and learned discipline.", visualDescription: "Chinese paper art. The Monkey King walking with a monk and other companions.", historyFact: "Ancient monks traveled dangerous paths to carry knowledge across Asia." },
    { text: "Through bravery, loyalty, and lesson-learning, the Monkey King became not just powerful—but wise.", visualDescription: "Chinese paper art. The Monkey King standing heroically in armor.", historyFact: "Sun Wukong is still one of China’s most beloved heroes." }
  ],
  "23": [
    { text: "Long ago, ten suns rose at once, scorching the Earth. A great archer, Hou Yi, shot down nine to save the world.", visualDescription: "Chinese paper art. An archer aiming a bow at ten suns in the sky.", historyFact: "The Mid-Autumn Festival celebrates moon legends like this one." },
    { text: "As a reward, Hou Yi received an elixir that would make him immortal. But he didn’t want to leave his beloved wife, Chang’e.", visualDescription: "Chinese paper art. The archer holding a bottle of elixir with his wife nearby.", historyFact: "Ancient Chinese stories highlight loyalty in marriage." },
    { text: "When a greedy apprentice tried to steal the elixir, Chang’e drank it to keep it safe and floated up to the moon.", visualDescription: "Chinese paper art. A woman floating up towards a large full moon.", historyFact: "In Chinese mythology, the moon is a home to magical beings." },
    { text: "Missing her deeply, Hou Yi placed her favorite foods outside under the moonlight to honor her.", visualDescription: "Chinese paper art. A table with food set out under the moonlight.", historyFact: "Mooncakes symbolize reunion and remembrance." },
    { text: "Every Mid-Autumn Festival, families gaze at the moon and remember the love shared between Hou Yi and Chang’e.", visualDescription: "Chinese paper art. Families looking up at the moon with lanterns.", historyFact: "This tale teaches devotion, sacrifice, and everlasting love." }
  ],
  "24": [
    { text: "Zhu Yingtai dressed as a boy to attend school. There, she became best friends with Liang Shanbo, who never guessed she was a girl.", visualDescription: "Chinese paper art. Two students reading scrolls together.", historyFact: "In ancient China, girls were often barred from formal schooling." },
    { text: "Zhu fell in love, but before she could reveal her secret, her family arranged a marriage for her.", visualDescription: "Chinese paper art. A girl looking sad in a traditional home.", historyFact: "Arranged marriages were common in old Chinese society." },
    { text: "When Liang finally learned the truth, he rushed to her home—but her wedding day had already arrived.", visualDescription: "Chinese paper art. A young man running towards a house decorated for a wedding.", historyFact: "Many Chinese romances involve destiny and longing." },
    { text: "Heartbroken, Liang passed away. When Zhu visited his grave, a storm opened the earth before her.", visualDescription: "Chinese paper art. A girl standing before a grave in a storm.", historyFact: "Graves in China are sacred places for families." },
    { text: "Zhu leapt into the earth, and together they transformed into butterflies—free, together, and eternal.", visualDescription: "Chinese paper art. Two colorful butterflies flying together.", historyFact: "Butterflies represent soulmates in Chinese folklore." }
  ],
  "25": [
    { text: "When Mulan’s elderly father was called to war, she disguised herself as a man and secretly took his place.", visualDescription: "Chinese paper art. A girl putting on warrior armor.", historyFact: "The original Mulan poem is over 1,500 years old." },
    { text: "Mulan trained bravely, becoming a skilled soldier admired by her fellow warriors.", visualDescription: "Chinese paper art. A warrior practicing sword fighting.", historyFact: "Women heroes appear in many lesser-known Chinese legends." },
    { text: "She fought for years without anyone discovering her true identity.", visualDescription: "Chinese paper art. Soldiers marching in a line.", historyFact: "Chinese armor and swords were crafted with beautiful detail." },
    { text: "When the war finally ended, Mulan returned home and removed her armor, revealing who she really was.", visualDescription: "Chinese paper art. A woman in traditional dress greeting her family.", historyFact: "Honoring family is a central value in Chinese culture." },
    { text: "Her bravery became legendary, inspiring generations to act with courage and heart.", visualDescription: "Chinese paper art. Mulan standing proudly.", historyFact: "Mulan represents filial piety—love and duty toward one’s family." }
  ],
  "26": [
    { text: "A kind scholar met a mysterious girl in the forest who painted shimmering, lifelike pictures.", visualDescription: "Chinese paper art. A scholar watching a girl painting in a forest.", historyFact: "Chinese folklore includes many magical artists and craftspeople." },
    { text: "She explained that her artwork could bring good dreams and protect homes.", visualDescription: "Chinese paper art. Glowing paintings floating in the air.", historyFact: "Protective charms called fu are used in traditional Chinese culture." },
    { text: "A jealous forest spirit tried to steal her magical brush, causing trouble for the scholar.", visualDescription: "Chinese paper art. A shadowy spirit reaching for a paintbrush.", historyFact: "Chinese spirits often mirror human emotions like envy." },
    { text: "Working together, the scholar and painter trapped the spirit inside one of her own paintings.", visualDescription: "Chinese paper art. The spirit being pulled into a landscape painting.", historyFact: "Art is believed to hold symbolic magic in many Chinese myths." },
    { text: "She left him a final painting—one that filled his home with peace and protection forever.", visualDescription: "Chinese paper art. A beautiful scroll hanging on a wall.", historyFact: "Many Chinese tales end with harmony restored through wisdom." }
  ],
  "27": [
    { text: "Yu Gong, an old man, lived beside two enormous mountains that made travel difficult. He decided he would move them—shovel by shovel.", visualDescription: "Chinese paper art. An old man digging at the base of a huge mountain.", historyFact: "Mountains symbolize endurance and strength in Chinese culture." },
    { text: "Neighbors laughed at him, saying he was far too old for such a huge task.", visualDescription: "Chinese paper art. Neighbors laughing at the old man working.", historyFact: "Many Chinese tales test determination against doubt." },
    { text: "Yu Gong said, “Even if I cannot finish, my children and grandchildren will continue.”", visualDescription: "Chinese paper art. The old man pointing to his family.", historyFact: "Family lineage and ancestors are deeply important in Chinese tradition." },
    { text: "The Jade Emperor admired his determination and ordered heavenly beings to move the mountains for him.", visualDescription: "Chinese paper art. Giant heavenly figures lifting the mountains.", historyFact: "The Jade Emperor is a major figure in Taoist mythology." },
    { text: "Yu Gong became a symbol of never giving up—no matter how big the challenge.", visualDescription: "Chinese paper art. A flat road where mountains used to be.", historyFact: "“Yu Gong Moves the Mountain” is still used today to describe unstoppable effort." }
  ],
  "28": [
    { text: "Ma Liang, a poor but talented boy, spent his days drawing in the sand with sticks.", visualDescription: "Chinese paper art. A boy drawing in the sand with a stick.", historyFact: "Painting and calligraphy are treasured arts in Chinese culture." },
    { text: "One night, a spirit gave him a magical paintbrush—anything he painted became real!", visualDescription: "Chinese paper art. A glowing paintbrush appearing to the boy.", historyFact: "Magic brushes appear often in Chinese children’s stories." },
    { text: "Ma Liang painted tools, food, and animals to help poor villagers.", visualDescription: "Chinese paper art. Painted food and tools becoming real objects.", historyFact: "Chinese tales frequently teach kindness and community duty." },
    { text: "A greedy ruler demanded gold, but Ma Liang tricked him by painting wild, stormy waves that carried him away.", visualDescription: "Chinese paper art. A boat in stormy painted waves.", historyFact: "Water symbolizes power and transformation in Chinese philosophy." },
    { text: "Ma Liang used the magical brush only to help those in need.", visualDescription: "Chinese paper art. The boy painting for villagers.", historyFact: "Artistic gifts are seen as responsibilities in traditional Chinese teachings." }
  ],
  "29": [
    { text: "Four dragons—Black, Yellow, Pearl, and Long—lived in the heavens, watching over the Earth.", visualDescription: "Chinese paper art. Four colorful dragons flying in the clouds.", historyFact: "Chinese dragons are symbols of kindness and good fortune." },
    { text: "They saw people suffering from a terrible drought. Taking action, they scooped seawater and poured it over the land.", visualDescription: "Chinese paper art. Dragons spraying water onto dry land.", historyFact: "Rivers are essential for farming throughout China." },
    { text: "The Jade Emperor grew angry that they acted without permission and imprisoned them under mountains.", visualDescription: "Chinese paper art. Mountains placed on top of dragons.", historyFact: "Some Chinese stories explain geography through mythology." },
    { text: "From beneath the mountains, the dragons transformed into four great rivers.", visualDescription: "Chinese paper art. Rivers flowing out from under mountains.", historyFact: "China’s major rivers, like the Yangtze, shape culture and travel." },
    { text: "The rivers still flow today, bringing life to the people forever.", visualDescription: "Chinese paper art. A flowing river through a green landscape.", historyFact: "This story teaches compassion—even when punished for helping." }
  ],
  "30": [
    { text: "A gentle fox spirit, disguised as a young girl, met a hardworking scholar and offered to help him study.", visualDescription: "Chinese paper art. A fox and a scholar sitting at a desk.", historyFact: "Fox spirits, or huli jing, appear across Chinese folklore." },
    { text: "She brought him books, warm meals, and encouragement when he felt tired.", visualDescription: "Chinese paper art. A girl bringing food to a studying man.", historyFact: "Education and civil exams were extremely important in ancient China." },
    { text: "When jealous rivals spread rumors, the fox spirit used her magic to protect him.", visualDescription: "Chinese paper art. Magical energy shielding the scholar.", historyFact: "Magical animals often serve as guardians in Chinese tales." },
    { text: "After he passed his exams, she revealed her true form and thanked him for his kindness.", visualDescription: "Chinese paper art. A fox looking at a man in official robes.", historyFact: "Not all fox spirits are tricksters—many are benevolent." },
    { text: "She disappeared into the forest, leaving behind a scroll filled with good fortune that blessed him forever.", visualDescription: "Chinese paper art. A scroll glowing in the forest.", historyFact: "Blessing scrolls are a traditional part of Chinese celebrations." }
  ],
  "31": [
    { text: "A clever monkey lived happily in a fruit tree by the river. One day, he saw a lonely crocodile below and kindly shared his sweet mangoes.", visualDescription: "Indian paper art. A monkey in a tree throwing fruit to a crocodile.", historyFact: "The Panchatantra is one of India’s oldest collections of animal stories." },
    { text: "The crocodile enjoyed the tasty fruit and friendship, but his greedy wife wanted to eat the monkey’s “sweet heart.”", visualDescription: "Indian paper art. Two crocodiles talking in the water.", historyFact: "Many Indian tales warn that greed can ruin good things." },
    { text: "One day, the crocodile invited the monkey for a ride on his back. In the middle of the river, he admitted his wife’s plan. The monkey stayed calm and thought quickly.", visualDescription: "Indian paper art. A monkey riding on a crocodile's back in a river.", historyFact: "Great Indian rivers like the Ganges and Yamuna appear in countless stories." },
    { text: "The monkey said, “Oh no! I left my heart in the tree. Take me back so I can get it.” Wanting the heart, the crocodile turned around.", visualDescription: "Indian paper art. The crocodile swimming back towards the tree.", historyFact: "Clever speech and quick thinking are key themes in Indian fables." },
    { text: "As soon as they reached the shore, the monkey leapt into his tree. He ended the false friendship but kept his life—and his wisdom.", visualDescription: "Indian paper art. The monkey safe in the tree looking down at the crocodile.", historyFact: "Panchatantra stories traveled around the world and shaped many children’s tales." }
  ],
  "32": [
    { text: "A gentle pair of sparrows built a nest high in a tree. One day, an angry elephant shook the tree roughly and their eggs fell and broke.", visualDescription: "Indian paper art. An elephant shaking a tree with birds flying out.", historyFact: "Elephants are sacred in India and appear in many legends." },
    { text: "Heartbroken, the sparrows called their friends—a woodpecker, a little fly, and a clever frog—to help them find justice.", visualDescription: "Indian paper art. A sparrow talking to a woodpecker, a fly, and a frog.", historyFact: "India’s forests are home to hundreds of colorful bird species." },
    { text: "Together, they formed a plan: the woodpecker would peck and blind the elephant, the fly would buzz and confuse him, and the frog would croak near a deep pit.", visualDescription: "Indian paper art. Small animals plotting together.", historyFact: "Many Indian stories show different animals working together." },
    { text: "The elephant, confused and frightened, followed the frog’s croaks and fell safely into the pit. He finally understood he could not bully smaller creatures.", visualDescription: "Indian paper art. An elephant falling into a pit.", historyFact: "Indian tales often show that even tiny beings are strong when united." },
    { text: "The sparrows felt at peace knowing that teamwork—not revenge—had brought justice.", visualDescription: "Indian paper art. Sparrows sitting peacefully in a tree.", historyFact: "Panchatantra stories usually praise wisdom over brute strength." }
  ],
  "33": [
    { text: "Tenali Raman, a witty poet in the king’s court, heard that thieves planned to rob his house. Instead of worrying, he came up with a clever trick.", visualDescription: "Indian paper art. A man smiling slyly in a traditional Indian house.", historyFact: "Tenali Raman is a famous figure from South Indian folklore." },
    { text: "He shouted loudly to his wife, “Let’s hide all our jewels in this chest and push it into the well!” The thieves secretly listening were delighted.", visualDescription: "Indian paper art. A couple pushing a chest towards a well.", historyFact: "Wells were once the main water source in Indian villages." },
    { text: "That night, the thieves arrived and spent hours pulling up bucket after bucket of water, searching for treasure—only to find muddy water and no chest.", visualDescription: "Indian paper art. Tired thieves pulling water from a well at night.", historyFact: "Indian humor stories often use smart words to confuse villains." },
    { text: "Exhausted and covered in mud, the thieves crawled out of the well—just as the king’s guards surrounded them.", visualDescription: "Indian paper art. Muddy thieves being caught by guards.", historyFact: "Ancient Indian towns used night patrols to keep people safe." },
    { text: "Everyone laughed when Tenali explained how simple words had fooled the thieves. The thieves learned that greed makes people easy to trick.", visualDescription: "Indian paper art. The poet laughing with the King.", historyFact: "Tenali tales teach that quick thinking is stronger than force." }
  ],
  "34": [
    { text: "A kind Brahmin walked past a cage and saw a tiger trapped inside. The tiger begged, “Please free me! I promise I won’t harm you.”", visualDescription: "Indian paper art. A man looking at a tiger in a cage.", historyFact: "Tigers, India’s national animal, appear in many traditional stories." },
    { text: "Feeling pity, the Brahmin opened the cage. Once free, the tiger growled, “Now I’m hungry. I will eat you.” The frightened Brahmin begged for a fair decision.", visualDescription: "Indian paper art. A tiger growling at a frightened man.", historyFact: "Many Indian tales include debates about right and wrong." },
    { text: "He asked a tree and a buffalo for help, but they said life was unfair and refused to protect him. Then a clever jackal arrived.", visualDescription: "Indian paper art. The man talking to a tree and a buffalo.", historyFact: "Jackals are often shown as smart problem-solvers in Indian folklore." },
    { text: "The jackal pretended not to understand and asked the tiger to show exactly how he had been trapped. When the tiger stepped back into the cage, the jackal slammed it shut.", visualDescription: "Indian paper art. A jackal closing a cage door on a tiger.", historyFact: "Trickster helpers like jackals appear often in village stories." },
    { text: "The Brahmin thanked the jackal, learning to remain kind—but also to be careful whom he trusts.", visualDescription: "Indian paper art. The man bowing thanks to the jackal.", historyFact: "Indian stories balance compassion with good judgment." }
  ],
  "35": [
    { text: "One day, Emperor Akbar asked his wise advisor Birbal, “Why do people fight over my mango orchard?”", visualDescription: "Indian paper art. An Emperor talking to his advisor in a palace.", historyFact: "Akbar was a real Mughal emperor known for his curiosity." },
    { text: "Birbal planted a mango seed before him and asked, “Will this tree give fruit today, Your Majesty?”", visualDescription: "Indian paper art. A man planting a seed in the ground.", historyFact: "Mangoes are India’s national fruit and are loved across the country." },
    { text: "Akbar laughed, “Of course not! Mango trees take many years to grow.”", visualDescription: "Indian paper art. The Emperor laughing.", historyFact: "Indian proverbs often connect patience with farming and nature." },
    { text: "Birbal replied, “Exactly. People should not expect fruit from trees they never planted or cared for.”", visualDescription: "Indian paper art. A wise man speaking to the Emperor.", historyFact: "Birbal’s stories use simple examples to explain big truths." },
    { text: "Akbar smiled, realizing that effort and patience are needed before enjoying any reward.", visualDescription: "Indian paper art. The Emperor nodding wisely.", historyFact: "Akbar–Birbal tales highlight wisdom and fairness over power." }
  ],
  "36": [
    { text: "A poor woodcutter was chopping wood by a river when his axe slipped from his hands and sank to the bottom. He sat and cried, not knowing what to do.", visualDescription: "Indian paper art. A woodcutter crying by a river.", historyFact: "Many Indian villages were built near rivers and streams." },
    { text: "A river goddess rose from the water, holding a shiny golden axe. “Is this yours?” she asked. The woodcutter shook his head. “No, mine was plain.”", visualDescription: "Indian paper art. A goddess in the river holding a gold axe.", historyFact: "Many Indian rivers are worshipped as goddesses." },
    { text: "She showed him a silver axe. “Is this yours?” He answered, “No, that’s not mine either.”", visualDescription: "Indian paper art. The goddess holding a silver axe.", historyFact: "Indian folklore often tests truthfulness with tempting choices." },
    { text: "Finally, she brought out his old iron axe. “Yes, that one is mine!” he said happily. Pleased with his honesty, the goddess gifted him all three axes.", visualDescription: "Indian paper art. The woodcutter accepting his iron axe.", historyFact: "Rewards for honesty are a common theme across Indian tales." },
    { text: "The woodcutter returned home grateful. His plain life was now easier, but his honesty was still his greatest treasure.", visualDescription: "Indian paper art. The woodcutter walking home with three axes.", historyFact: "This story exists in many parts of India with small changes." }
  ],
  "37": [
    { text: "A turtle, a deer, a crow, and a mouse lived together as best friends in the forest. They promised always to help one another.", visualDescription: "Indian paper art. A turtle, deer, crow, and mouse together.", historyFact: "Indian jungles are home to many animals that star in folktales." },
    { text: "One day, the deer was trapped in a hunter’s net. The mouse quickly rushed over and chewed through the ropes, setting him free.", visualDescription: "Indian paper art. A mouse chewing a net to free a deer.", historyFact: "Different animals in Indian stories represent different strengths." },
    { text: "Later, the turtle was caught by the same hunter. The friends worked out a plan to save him too.", visualDescription: "Indian paper art. A turtle caught in a bag or net.", historyFact: "Teamwork is a central lesson in many Panchatantra stories." },
    { text: "The deer pretended to lie injured on the path. The crow flew overhead and cawed loudly to draw attention.", visualDescription: "Indian paper art. A deer lying down while a crow flies above.", historyFact: "Pretend play and acting appear often in Indian animal fables." },
    { text: "When the hunter ran toward the “injured” deer, the mouse quickly gnawed the turtle’s ropes. The deer then jumped up and ran away, proving that true friendship can defeat any danger.", visualDescription: "Indian paper art. The hunter running while the animals escape.", historyFact: "These stories taught children in ancient India how cooperation keeps communities strong." }
  ],
  "38": [
    { text: "A poor woman met a holy sage who gave her a magic pot. “Say ‘Cook!’ and it will fill with delicious food,” he said. ", visualDescription: "Indian paper art. A woman accepting a pot from a sage.", historyFact: "Wise sages often appear in Indian legends as kind teachers." },
    { text: "She used the pot to feed her family, and they were never hungry again.", visualDescription: "Indian paper art. A family eating happily.", historyFact: "Sharing food is an important part of Indian family life." },
    { text: "One day, while the mother was away, her curious daughter said, “Cook!” The pot started filling again and again.", visualDescription: "Indian paper art. A pot overflowing with food.", historyFact: "Many Indian tales gently teach children about responsibility." },
    { text: "The pot overflowed, covering the house and street with hot porridge. When the mother returned, she quickly said, “Stop!” and the pot finally calmed down.", visualDescription: "Indian paper art. Porridge filling a street.", historyFact: "Magical household objects are common in Indian folktales." },
    { text: "The villagers laughed as they cleaned up. The girl learned that even wonderful magic must be used wisely.", visualDescription: "Indian paper art. Villagers cleaning up food.", historyFact: "Indian storytelling often combines humor with important lessons." }
  ],
  "39": [
    { text: "Savitri chose to marry Satyavan even though she knew he was destined to live only one more year. Her love was stronger than fear.", visualDescription: "Indian paper art. A bride and groom standing together.", historyFact: "Indian epics are full of love stories shaped by fate." },
    { text: "One day, Satyavan collapsed in the forest and died. Yama, the god of death, came to take his soul. Savitri followed him, refusing to turn back.", visualDescription: "Indian paper art. A woman following a god figure in the forest.", historyFact: "Yama is the ancient Indian deity who guides souls after death." },
    { text: "Impressed, Yama offered her a wish—anything except Satyavan’s life. Savitri asked for many children.", visualDescription: "Indian paper art. The woman talking to the god.", historyFact: "Indian gods often grant wishes with tricky conditions." },
    { text: "Yama agreed, then realized she could not have children without her husband alive. He admired her cleverness and devotion.", visualDescription: "Indian paper art. The god looking surprised and pleased.", historyFact: "Clever reasoning is celebrated throughout Indian mythology." },
    { text: "Yama restored Satyavan’s life, and their love became a symbol of courage and loyalty.", visualDescription: "Indian paper art. The couple reunited and happy.", historyFact: "This story is honored during the Vat Savitri festival, where married women pray for their husbands’ long lives." }
  ],
  "40": [
    { text: "A wise princess was famous for solving riddles and tricky problems better than any court advisor.", visualDescription: "Indian paper art. A princess sitting on a throne thinking.", historyFact: "Jataka tales share stories from the Buddha’s past lives." },
    { text: "One day, two people argued over a golden necklace found on the road. Each claimed it was theirs.", visualDescription: "Indian paper art. Two people arguing over a necklace.", historyFact: "Ancient India used public courts to settle disputes." },
    { text: "The princess asked questions and noticed that one person would not look her in the eye.", visualDescription: "Indian paper art. The princess looking closely at the two people.", historyFact: "Many Indian stories teach children to observe carefully." },
    { text: "She ordered the necklace to be cut in half. One person agreed. The other cried out, “No! I’d rather lose it than see it destroyed!”", visualDescription: "Indian paper art. A guard raising a sword over the necklace.", historyFact: "Similar wisdom appears in famous stories from many cultures." },
    { text: "The princess gave the necklace to the one who cared more about it than herself. She praised truth and love over greed.", visualDescription: "Indian paper art. The princess giving the necklace to the honest person.", historyFact: "Jataka tales often end by honoring fairness, kindness, and compassion." }
  ],
  "41": [
    { text: "An old couple found a giant peach floating down the river. When they opened it, a smiling baby boy popped out! They named him Momotaro, “Peach Boy,” and raised him with love.", visualDescription: "Japanese paper art. An old couple opening a giant peach with a baby inside.", historyFact: "Rivers in Japanese stories often bring magical visitors and events." },
    { text: "Momotaro grew strong, polite, and brave. When ogres began stealing from nearby villages, he promised to stop them and bring peace back.", visualDescription: "Japanese paper art. A young boy standing bravely.", historyFact: "Japanese ogres, called oni, stand for trouble and chaos." },
    { text: "On his journey, Momotaro shared rice cakes with a dog, a monkey, and a pheasant. Grateful, they joined him as loyal companions.", visualDescription: "Japanese paper art. A boy, dog, monkey, and bird walking together.", historyFact: "In Japan, dogs, monkeys, and pheasants often symbolize loyalty, cleverness, and courage." },
    { text: "Together, the four friends sailed to Ogre Island, worked as a team, defeated the ogres, and gathered back the stolen treasures.", visualDescription: "Japanese paper art. The team fighting ogres on an island.", historyFact: "Many Japanese folktales celebrate teamwork and harmony." },
    { text: "Momotaro and his friends returned home with the treasure and smiles all around. The land was peaceful again.", visualDescription: "Japanese paper art. The heroes returning to the village.", historyFact: "Momotaro is still celebrated in Japanese festivals and children’s books." }
  ],
  "42": [
    { text: "A mischievous green frog never listened to his mother. If she said “Go left,” he went right. If she said “Be quiet,” he croaked loudly.", visualDescription: "Korean paper art. A small green frog jumping the wrong way.", historyFact: "Korean folktales often teach children to respect parents and elders." },
    { text: "As she grew older, Mother Frog worried that he would never behave, even when it really mattered.", visualDescription: "Korean paper art. An older mother frog looking worried.", historyFact: "Filial piety—caring for parents—is an important value in Korean culture." },
    { text: "Before she passed away, she made one final wish: “Bury me by the river.” She hoped that, as usual, he would do the opposite and keep her safe on a hill.", visualDescription: "Korean paper art. The mother frog speaking to her son.", historyFact: "Rivers in Korean folklore often mark the border between this world and the next." },
    { text: "But for the first time, the frog decided to truly obey his mother. He buried her by the river, just as she asked.", visualDescription: "Korean paper art. The frog burying his mother near the river.", historyFact: "This story explains why green frogs are said to cry when it rains." },
    { text: "When heavy rains fall and the river rises, the green frog worries the water will wash her away. His sad croaking reminds everyone to cherish their parents while they are here.", visualDescription: "Korean paper art. A green frog crying in the rain.", historyFact: "In Korea, “green frog” can describe someone who never listens." }
  ],
  "43": [
    { text: "A turtle and a monkey found a banana tree. Monkey grabbed the leafy top, and Turtle took the roots. They planted their halves.", visualDescription: "Filipino paper art. A monkey holding leaves and a turtle holding roots.", historyFact: "Banana trees grow easily in the Philippines and appear in many tales." },
    { text: "Monkey’s top withered and died, but Turtle’s rooted half grew into a strong tree full of bananas.", visualDescription: "Filipino paper art. A dead plant next to a healthy banana tree.", historyFact: "In Filipino stories, turtles often stand for patience and wisdom." },
    { text: "Jealous and hungry, Monkey stole the bananas from Turtle’s tree and laughed, believing Turtle was too slow to do anything.", visualDescription: "Filipino paper art. A monkey eating bananas in a tree while a turtle watches.", historyFact: "Trickster monkeys appear in many Southeast Asian folktales." },
    { text: "Turtle quietly set clever traps in the forest. Monkey stumbled into them and was finally caught.", visualDescription: "Filipino paper art. A monkey caught in a simple trap.", historyFact: "Indigenous Filipino groups used simple traps to live off the land." },
    { text: "After a hard lesson, Monkey apologized. From then on, Turtle and Monkey shared the bananas fairly.", visualDescription: "Filipino paper art. The monkey and turtle eating together.", historyFact: "Filipino folktales often end by teaching sharing and community harmony." }
  ],
  "44": [
    { text: "Malin Kundang was a poor boy who left his seaside village to find fortune at sea. He promised his mother he would return to her one day.", visualDescription: "Indonesian paper art. A boy waving goodbye to his mother from a boat.", historyFact: "Indonesia, made of thousands of islands, has a rich seafaring history." },
    { text: "Malin became very rich and married a princess. In his new life, he grew proud and ashamed of his humble beginnings.", visualDescription: "Indonesian paper art. A wealthy man in fine clothes on a big ship.", historyFact: "Indonesian tales often warn against forgetting one’s roots." },
    { text: "When his ship returned to his old village, his mother rushed to see him. But Malin, embarrassed by her poor clothes, denied knowing her.", visualDescription: "Indonesian paper art. A rich man turning away from a poor woman.", historyFact: "Respecting parents is a deeply held value in Indonesian culture." },
    { text: "Heartbroken, his mother prayed for nature to teach him a lesson. A terrible storm came, and Malin was turned into stone.", visualDescription: "Indonesian paper art. A storm hitting a ship and a man turning to stone.", historyFact: "Many coastal rock formations in Indonesia are tied to legends like this." },
    { text: "To this day, people say a stone shaped like a kneeling man sits by the sea, reminding everyone never to be ashamed of where they come from.", visualDescription: "Indonesian paper art. A stone shaped like a man on a beach.", historyFact: "Indonesian parents retell this story to teach gratitude and respect." }
  ],
  "45": [
    { text: "A kind fisherman freed a tiny goby fish caught in his net. To his surprise, the goby spoke and promised to help him someday.", visualDescription: "Vietnamese paper art. A fisherman releasing a small fish back into the water.", historyFact: "Vietnam’s rivers and deltas are rich with fish and legends." },
    { text: "Later, a greedy landlord demanded impossible taxes from the poor villagers, including the fisherman.", visualDescription: "Vietnamese paper art. A rich landlord shouting at villagers.", historyFact: "Vietnamese folktales often show landlords as selfish villains." },
    { text: "The fisherman went to the river for help. The goby appeared as a shining golden dragon and offered him magical assistance.", visualDescription: "Vietnamese paper art. A golden dragon rising from the river.", historyFact: "Vietnamese dragons symbolize water, prosperity, and protection." },
    { text: "With the dragon’s help, the landlord’s cruelty was revealed to the emperor, who punished the landlord and brought fairness back to the village.", visualDescription: "Vietnamese paper art. An Emperor judging a landlord.", historyFact: "Justice and fairness are strong themes in Vietnamese legends." },
    { text: "The golden goby returned to the water, and the villagers lived in peace and plenty once more.", visualDescription: "Vietnamese paper art. Peaceful villagers fishing by the river.", historyFact: "Water creatures often appear as guardians in Vietnamese folklore." }
  ],
  "46": [
    { text: "Mouse Deer, tiny but clever, wandered into Tiger’s part of the jungle. Tiger growled, ready to pounce and make him into a snack.", visualDescription: "Malaysian paper art. A small mouse deer facing a tiger.", historyFact: "The sang kancil (mouse deer) is a famous trickster hero in Malaysian tales." },
    { text: "Mouse Deer saw his chance. He pointed to the still pond and cried, “Wait! The true king of the jungle is bathing there!”", visualDescription: "Malaysian paper art. The mouse deer pointing at a pond.", historyFact: "Malaysian rainforests are filled with ponds and streams that reflect like mirrors." },
    { text: "Curious, Tiger leaned over the water to see this “king.” Mouse Deer gave a quick push—and Tiger tumbled into the pond!", visualDescription: "Malaysian paper art. A tiger falling into water.", historyFact: "Tigers once roamed widely across Malaysia’s jungles." },
    { text: "Soaked and furious, Tiger chased Mouse Deer. But the little trickster slipped under thorny bushes where Tiger couldn’t follow.", visualDescription: "Malaysian paper art. A mouse deer running under bushes.", historyFact: "Thorny shrubs and dense plants are common in Southeast Asian jungles." },
    { text: "Tiger roared in frustration while Mouse Deer escaped, giggling. Once again, brains beat brawn.", visualDescription: "Malaysian paper art. A wet tiger looking angry.", historyFact: "Malaysian stories often use humor to show that intelligence beats strength." }
  ],
  "47": [
    { text: "Two orphaned sisters lived together: one was gentle and kind, the other selfish and mean-spirited.", visualDescription: "Cambodian paper art. Two sisters, one smiling and one frowning.", historyFact: "Cambodian folktales often show clear contrasts between good and bad behavior." },
    { text: "One day, the kind sister helped a wounded bird. In gratitude, the bird led her to a magical tree that showered her with jewels and gifts.", visualDescription: "Cambodian paper art. A girl standing under a tree raining jewels.", historyFact: "Trees are sacred symbols in many Cambodian stories." },
    { text: "The greedy sister tried to copy her. She forced a bird to help her, yelling and demanding treasure.", visualDescription: "Cambodian paper art. A girl yelling at a bird.", historyFact: "Cambodian tales warn that anger and greed shut the door to blessings." },
    { text: "Instead of jewels, the magical tree poured mud, thorns, and insects all over the greedy sister.", visualDescription: "Cambodian paper art. A tree dropping mud on a girl.", historyFact: "Stories across Southeast Asia often reward kindness and punish greed symbolically." },
    { text: "The kind sister shared her riches anyway, hoping her sibling would learn to be gentle. Slowly, the selfish sister began to change.", visualDescription: "Cambodian paper art. The kind sister sharing with the mean sister.", historyFact: "Cambodian stories often end with forgiveness and second chances." }
  ],
  "48": [
    { text: "A bird, a rabbit, a monkey, and an elephant lived near a small tree. Each had helped it grow in different ways.", visualDescription: "Tibetan paper art. Four animals standing near a tree.", historyFact: "This story appears in both Tibetan Buddhist and Mongolian traditions." },
    { text: "They discovered that the bird had planted the seed, the rabbit cared for the sapling, the monkey tended the young tree, and the elephant protected it as it grew tall. They agreed the bird was eldest and should be honored.", visualDescription: "Tibetan paper art. Animals bowing to a bird.", historyFact: "Respect for elders is very important in Himalayan cultures." },
    { text: "To reach the fruit, the elephant stood at the bottom, the monkey climbed on his back, the rabbit on the monkey, and the bird on top.", visualDescription: "Tibetan paper art. Animals stacked on top of each other.", historyFact: "Cooperation and mutual support are core themes in Buddhist teachings." },
    { text: "Together, they enjoyed the fruit and shared it with other animals, bringing harmony to the forest.", visualDescription: "Tibetan paper art. Animals eating fruit together.", historyFact: "Mongolian tales often focus on balance between animals, people, and nature." },
    { text: "The story spread far and wide to show that unity, respect, and cooperation make everyone’s lives better.", visualDescription: "Tibetan paper art. The four friends in a harmonious landscape.", historyFact: "This tale is painted on monastery walls across Tibet as a symbol of harmony." }
  ],
  "49": [
    { text: "On a small Thai farm, a hardworking hen planted rice seeds. Nearby, Duck and Pig played in the mud, not offering to help.", visualDescription: "Thai paper art. A hen planting seeds while a pig and duck play.", historyFact: "Rice farming is central to life and culture in Thailand." },
    { text: "Hen asked Duck and Pig to help water the rice. They refused, saying they were too busy playing.", visualDescription: "Thai paper art. The hen asking the animals for help.", historyFact: "Many Thai folktales encourage diligence and kindness." },
    { text: "When it was time to harvest, Hen asked again. Duck and Pig still said no.", visualDescription: "Thai paper art. The hen harvesting rice alone.", historyFact: "Thai stories often use farm animals to teach responsibility." },
    { text: "When the rice was cooked into a delicious meal, Duck and Pig rushed over, eager to eat.", visualDescription: "Thai paper art. The hen cooking rice with the animals looking hungry.", historyFact: "Eating together is an important part of Thai family traditions." },
    { text: "Hen smiled and shared some food, but gently reminded them that rewards usually come to those who work for them.", visualDescription: "Thai paper art. The hen sharing food with the others.", historyFact: "Thai proverbs often say that effort and fairness go hand in hand." }
  ],
  "50": [
    { text: "A princess was promised to a brave prince. But a demon snake, using magic, disguised itself as the prince and carried her away.", visualDescription: "Nepalese paper art. A snake spirit carrying a princess away.", historyFact: "Nepalese folklore includes many shape-shifting spirits and creatures." },
    { text: "The real prince discovered what happened and searched far and wide—across rivers, forests, and into the high mountains—to find her.", visualDescription: "Nepalese paper art. A prince climbing a high mountain.", historyFact: "Nepal’s landscape stretches from deep valleys to the Himalayas." },
    { text: "He met a wise hermit living in a cave. The hermit taught him a sacred mantra to reveal the demon snake’s true form.", visualDescription: "Nepalese paper art. A prince talking to a hermit in a cave.", historyFact: "Holy sages and hermits play important roles in Nepalese tales." },
    { text: "The prince spoke the mantra when he found the false “prince.” The demon’s disguise melted away, revealing the giant snake, which he then defeated.", visualDescription: "Nepalese paper art. A prince fighting a giant snake.", historyFact: "Many Nepalese stories show spiritual wisdom overcoming evil." },
    { text: "The princess was freed, and they returned safely to their kingdom, where they ruled with courage and kindness.", visualDescription: "Nepalese paper art. The prince and princess returning home.", historyFact: "Nepalese folklore often blends bravery, love, and spiritual strength." }
  ],
  "51": [
    { text: "Long ago, the animals lived in darkness and cold. One day, lightning struck a tree far away on an island, setting it on fire. The animals gathered to decide who could bring this new warmth back.", visualDescription: "Cherokee paper art. Animals looking at a burning tree on an island.", historyFact: "The Cherokee homeland stretches across the Appalachian Mountains." },
    { text: "Raven flew bravely to the island to grab some fire. But when he got close, the smoke and flames turned his feathers dark and black.", visualDescription: "Cherokee paper art. A black raven flying near fire.", historyFact: "This story explains why ravens have shiny black feathers." },
    { text: "Next, Screech Owl and Hoot Owl tried. They swooped near the flames, but sparks flew into their eyes, making them red and rimmed.", visualDescription: "Cherokee paper art. Owls flying away from fire with red eyes.", historyFact: "Cherokee tales often explain how animals got their special features." },
    { text: "At last, little Water Spider spoke up. She spun a tiny bowl from her web and floated across the water. Carefully, she carried a small coal of fire back in her web-bowl.", visualDescription: "Cherokee paper art. A spider carrying a glowing coal across water.", historyFact: "Water Spider is a hero in many Southeastern tribal stories." },
    { text: "From that day on, the animals had fire to keep them warm and cook their food—all thanks to the smallest, bravest helper.", visualDescription: "Cherokee paper art. Animals gathering around a fire.", historyFact: "Many Indigenous stories teach that true courage isn’t about size." }
  ],
  "52": [
    { text: "Three brothers once tracked a giant bear through the forest. Suddenly, the bear climbed higher and higher—right into the sky. The brothers followed without fear.", visualDescription: "Iroquois paper art. Hunters chasing a bear into the sky.", historyFact: "The Haudenosaunee Confederacy is one of the world’s oldest democracies." },
    { text: "The chase continued among the clouds. As the bear ran, it began to glow brighter, lighting up the sky.", visualDescription: "Iroquois paper art. A glowing bear running in the clouds.", historyFact: "Many Indigenous nations explain constellations through heroic adventures." },
    { text: "At last, the great bear settled into the sky and became a group of bright stars.", visualDescription: "Iroquois paper art. Stars forming the shape of a bear.", historyFact: "This story explains how the Big Dipper moves and changes position." },
    { text: "The three brothers stayed close, becoming stars as well, forever hunting the bear across the night.", visualDescription: "Iroquois paper art. Three stars following the bear constellation.", historyFact: "Haudenosaunee star stories help mark seasons and time." },
    { text: "Even today, as the Great Bear rises and falls with the seasons, people remember the bravery of the hunters.", visualDescription: "Iroquois paper art. People looking up at the night sky.", historyFact: "Indigenous sky stories often blend astronomy and adventure." }
  ],
  "53": [
    { text: "A brave warrior gave his life protecting his people. To honor his courage, the gods transformed him into a tiny, shining hummingbird.", visualDescription: "Aztec paper art. A warrior transforming into a hummingbird.", historyFact: "The Aztec god Huitzilopochtli is linked to hummingbirds and war." },
    { text: "The hummingbird flew through forests and fields, gathering sunlight and strength as he watched over those he loved.", visualDescription: "Aztec paper art. A hummingbird flying over Aztec lands.", historyFact: "Hummingbirds were sacred symbols of renewal and energy." },
    { text: "Wherever he hovered, bright flowers bloomed, as if the Earth itself welcomed his gentle visit.", visualDescription: "Aztec paper art. Flowers blooming behind a hummingbird.", historyFact: "Mexico is home to more than 50 species of hummingbirds." },
    { text: "People said that when a hummingbird came close, a protective spirit had come to bring blessings.", visualDescription: "Aztec paper art. People smiling at a hummingbird.", historyFact: "In Aztec belief, fallen warriors could return as birds." },
    { text: "To this day, many families see hummingbirds as small messengers of strength, love, and remembrance.", visualDescription: "Aztec paper art. A family watching a hummingbird.", historyFact: "This tradition continues in modern Mexican culture and stories." }
  ],
  "54": [
    { text: "Long ago, a gentle woman walked near the river, crying softly for mistakes she had made. She wished to warn others not to make the same ones.", visualDescription: "Mexican paper art. A woman in white walking by a river at night.", historyFact: "La Llorona is one of Mexico’s most famous legends." },
    { text: "Children playing by the river sometimes heard her gentle voice: “Stay safe. Go home before dark.”", visualDescription: "Mexican paper art. Children playing near water hearing a voice.", historyFact: "Rivers in Mexican stories are often home to spirits and mysteries." },
    { text: "When storms rolled in and the river grew wild, her voice seemed louder, reminding families to stay together indoors.", visualDescription: "Mexican paper art. A stormy river with a ghostly figure.", historyFact: "Central Mexico often has powerful thunderstorms." },
    { text: "Parents told her story so children would be careful near water and always listen when called home.", visualDescription: "Mexican paper art. Parents telling a story to children.", historyFact: "Many Latin American legends are also secret safety lessons." },
    { text: "Over time, people began to see her as a guardian spirit, watching over children along the riverbanks.", visualDescription: "Mexican paper art. A guardian spirit watching over the river.", historyFact: "Modern retellings often soften the La Llorona tale for younger listeners." }
  ],
  "55": [
    { text: "One day, a farmer found an injured snake in the forest. Instead of running away, he gently picked it up and carried it home to heal.", visualDescription: "Mayan paper art. A farmer holding a snake in the jungle.", historyFact: "The ancient Maya respected many animals as sacred beings." },
    { text: "As the snake grew stronger, it spoke and revealed that it was actually a powerful spirit guardian in disguise.", visualDescription: "Mayan paper art. A glowing spirit snake talking to the farmer.", historyFact: "Shape-shifting spirits and deities appear often in Mayan folklore." },
    { text: "The snake warned the farmer that a long drought was coming and taught him how to store and save water wisely.", visualDescription: "Mayan paper art. The snake teaching the farmer.", historyFact: "Rain and drought cycles shaped everyday life in Mayan times." },
    { text: "When the drought finally came, the farmer’s fields stayed green and healthy, while other farms dried up.", visualDescription: "Mayan paper art. Green fields next to dry land.", historyFact: "The Maya built advanced systems to manage water and irrigation." },
    { text: "Grateful, the farmer and his family honored the snake’s wisdom for generations, passing down the story.", visualDescription: "Mayan paper art. A Mayan family giving thanks.", historyFact: "Snakes appear in Mayan carvings, temples, and sacred symbols." }
  ],
  "56": [
    { text: "When winter first arrived, the forest animals shivered in the cold. Crow, then bright and colorful, volunteered to seek help.", visualDescription: "Lenape paper art. A colorful crow talking to shivering animals.", historyFact: "The Lenape homeland includes present-day New Jersey, Pennsylvania, and Delaware." },
    { text: "Crow flew to the Great Spirit and asked for warmth. The Great Spirit gave him a burning stick of fire to carry back.", visualDescription: "Lenape paper art. A crow receiving fire from a spirit.", historyFact: "Fire is sacred in many Native traditions, symbolizing life and spirit." },
    { text: "As Crow flew through wind and snow, the flames scorched his feathers and filled his voice with smoke.", visualDescription: "Lenape paper art. A crow flying with fire, feathers turning black.", historyFact: "This story explains Crow’s black feathers and raspy caw." },
    { text: "Crow reached the animals and shared the fire, saving them from the freezing cold—but losing his bright colors forever.", visualDescription: "Lenape paper art. A black crow giving fire to animals.", historyFact: "Many Indigenous stories honor those who give up something for others." },
    { text: "The Great Spirit promised that when sunlight hits Crow’s black feathers, hidden rainbow colors would shimmer faintly as a sign of his bravery.", visualDescription: "Lenape paper art. A black crow with shimmering feathers.", historyFact: "Lenape tales often blend nature with deep spiritual meaning." }
  ],
  "57": [
    { text: "Once, Jaguar had a roar so loud it shook the whole rainforest. He used it just to scare smaller animals for fun.", visualDescription: "Brazilian paper art. A jaguar roaring loudly in the jungle.", historyFact: "Jaguars are powerful symbols in Amazonian myths." },
    { text: "A small bird asked Jaguar kindly, “Please stop frightening everyone.” Jaguar just laughed and roared even louder.", visualDescription: "Brazilian paper art. A small bird talking to a jaguar.", historyFact: "In Brazilian tribal stories, small animals are often the wisest." },
    { text: "The bird flew to the forest spirit, who listened carefully and decided Jaguar needed a lesson in kindness.", visualDescription: "Brazilian paper art. A bird talking to a glowing forest spirit.", historyFact: "Forest spirits appear in many Tupi and Amazonian legends." },
    { text: "The next morning, Jaguar tried to roar—but only a tiny whisper came out. His mighty voice was gone.", visualDescription: "Brazilian paper art. A jaguar looking confused and silent.", historyFact: "Amazonian myths often explain animal traits with magical events." },
    { text: "From then on, Jaguar moved quietly and respectfully through the forest, remembering that power should never be used just to bully others.", visualDescription: "Brazilian paper art. A jaguar walking quietly in the forest.", historyFact: "Respect for nature and its creatures runs deep in South American folklore." }
  ],
  "58": [
    { text: "A young shepherd girl cared for her llamas high in the Andes mountains. One day, a great condor swooped down and turned into a handsome young man.", visualDescription: "Andean paper art. A girl with llamas and a condor transforming into a man.", historyFact: "Condors are sacred birds in Andean cultures." },
    { text: "He invited her to visit his sky kingdom and gently carried her up into the clouds.", visualDescription: "Andean paper art. A man carrying a girl into the sky.", historyFact: "The Andes are among the highest mountains in the world." },
    { text: "In the condor’s home, she met other condor families who welcomed her and offered her food, music, and golden feathers.", visualDescription: "Andean paper art. A girl in a cloud kingdom with condor people.", historyFact: "Andean stories often mix human and animal worlds." },
    { text: "Though the sky kingdom was beautiful, the girl missed her village and her llamas. She told the condor she needed to return.", visualDescription: "Andean paper art. The girl looking down at the earth sadly.", historyFact: "Many mountain tales speak about freedom and where we truly belong." },
    { text: "Understanding her heart, the condor brought her home safely. She kept a single condor feather as a reminder of the friendship between earth and sky.", visualDescription: "Andean paper art. The girl back with her llamas holding a feather.", historyFact: "Condor feathers symbolize honor and spiritual strength in the Andes." }
  ],
  "59": [
    { text: "In the far north, a brother and sister lived in a village where winter nights were long and dark.", visualDescription: "Inuit paper art. A boy and girl in a snowy village at night.", historyFact: "Inuit communities experience months with very little sunlight." },
    { text: "One stormy night, the sister lit a torch and held it high to guide her brother safely back through wind and snow.", visualDescription: "Inuit paper art. A girl holding a torch in a snowstorm.", historyFact: "Fire and light are powerful symbols in Arctic storytelling." },
    { text: "Following the warm glow, the brother found his way home. The small torch meant safety, warmth, and family.", visualDescription: "Inuit paper art. The boy walking towards the light.", historyFact: "Inuit tales often highlight family bonds and survival together." },
    { text: "Seeing this act of love, the spirits lifted them into the sky—one to shine as the Sun and the other to glow as the Moon.", visualDescription: "Inuit paper art. The siblings rising into the sky to become sun and moon.", historyFact: "Inuit sky stories often see celestial bodies as family members." },
    { text: "Now the Sun and Moon take turns lighting the Arctic, watching over their people from above.", visualDescription: "Inuit paper art. Sun and moon shining over the arctic.", historyFact: "Many Inuit stories explain natural cycles—like day and night—through family stories." }
  ],
  "60": [
    { text: "A young boy wandering the mountains discovered a hidden lake whose waters shimmered whenever a kind-hearted person came near.", visualDescription: "Andean paper art. A boy looking at a shimmering mountain lake.", historyFact: "Ecuador’s Andes are dotted with beautiful high-altitude lakes." },
    { text: "When his village suffered a terrible drought, the boy returned to the magic lake to ask for help.", visualDescription: "Andean paper art. The boy kneeling by the lake.", historyFact: "Water scarcity has inspired many Andean myths and rituals." },
    { text: "The spirit of the lake appeared and said, “I will help your village, but you must all promise to protect these mountains and waters.”", visualDescription: "Andean paper art. A water spirit talking to the boy.", historyFact: "Nature guardians—mountain and lake spirits—are common in Andean legends." },
    { text: "The villagers agreed and treated the land with care. Soon, rain poured down, filling rivers and reviving fields and crops.", visualDescription: "Andean paper art. Rain falling on green fields.", historyFact: "Andean farming depends greatly on rainfall from the mountains." },
    { text: "From then on, the people honored the magic lake, keeping their promise and living in harmony with the land.", visualDescription: "Andean paper art. Villagers celebrating near the lake.", historyFact: "Ecuadorian stories often carry messages about caring for the environment." }
  ]
};

const STORY_CATALOG: Story[] = [
  { id: "1", assetId: 1, title: "Anansi and the Moss-Covered Rock", region: "Ghana – Akan", summary: "Anansi uses a magic sleeping rock to trick the other animals, but Little Deer turns the tables on him." },
  { id: "2", assetId: 2, title: "Why the Sun and Moon Live in the Sky", region: "Nigeria – Efik/Ibibio", summary: "Sun and Moon build a big house for their friend Water, but Water brings so many friends they have to move to the sky!" },
  { id: "3", assetId: 3, title: "The Clever Jackal Gets Away", region: "South Africa – San", summary: "Jackal tricks the mighty Lion by pretending the sky is falling, proving that wits can beat strength." },
  { id: "4", assetId: 4, title: "The Lion’s Whisker", region: "Ethiopia", summary: "A woman learns patience by slowly befriending a lion to get a whisker, teaching her how to bond with her family." },
  { id: "5", assetId: 5, title: "The Hare and the Elephant", region: "Kenya", summary: "Hare tricks Elephant and Hippo into a tug-of-war with each other, making them think he is the strongest animal." },
  { id: "6", assetId: 6, title: "The Magic Drum", region: "Nigeria – Yoruba", summary: "A magic drum provides food when played gently, but chaos when played with greed. A lesson on sharing." },
  { id: "7", assetId: 7, title: "Why the Sky Is Far Away", region: "Nigeria", summary: "The sky used to be close enough to eat, but people wasted it. Now it stays far away to protect itself." },
  { id: "8", assetId: 8, title: "The Tortoise and the Birds", region: "Igbo – Nigeria", summary: "Tortoise tricks the birds to get a feast in the sky, but they take back their feathers, leading to his cracked shell." },
  { id: "9", assetId: 9, title: "The Girl Who Brought the Rain", region: "Zulu – South Africa", summary: "Brave Lindiwe climbs a sacred mountain to sing to the spirits and ends a terrible drought." },
  { id: "10", assetId: 10, title: "Kalulu the Hare", region: "Tanzania / Uganda", summary: "Kalulu beats Leopard in a race by using a secret path, teaching that being clever is better than just being fast." },
  { id: "11", assetId: 11, title: "The Boy Who Cried Wolf", region: "Greece", summary: "A shepherd boy tricks villagers by crying 'Wolf!' until they stop believing him when a real wolf appears." },
  { id: "12", assetId: 12, title: "The Bremen Town Musicians", region: "Germany", summary: "Four aging animals run away to become musicians and end up scaring robbers out of a cozy cabin." },
  { id: "13", assetId: 13, title: "Little Red Riding Hood", region: "France", summary: "A girl meets a tricky wolf on her way to Grandma's house and learns a valuable lesson about strangers." },
  { id: "14", assetId: 14, title: "The Gingerbread Man", region: "England", summary: "A cookie runs away from everyone who wants to eat him, until he meets a clever fox at the river." },
  { id: "15", assetId: 15, title: "The Snow Queen", region: "Denmark", summary: "Gerda travels through a frozen world to save her friend Kai from the Snow Queen's icy spell." },
  { id: "16", assetId: 16, title: "The Twelve Dancing Princesses", region: "Germany", summary: "A soldier discovers where the king's daughters go every night to dance their shoes to pieces." },
  { id: "17", assetId: 17, title: "The Princess and the Pea", region: "Denmark", summary: "A prince finds a real princess when she can feel a tiny pea hidden under twenty mattresses." },
  { id: "18", assetId: 18, title: "The Fisherman and His Wife", region: "Germany", summary: "A magical fish grants wishes, but the wife's greed eventually causes them to lose everything." },
  { id: "19", assetId: 19, title: "Jack and the Beanstalk", region: "England", summary: "Jack climbs a magic beanstalk to a giant's castle and returns with treasures to help his mother." },
  { id: "20", assetId: 20, title: "The Selkie Bride", region: "Scotland", summary: "A fisherman marries a seal-woman, but her heart eventually calls her back to the sea." },
  { id: "21", assetId: 21, title: "The Cowherd and the Weaver Girl", region: "China", summary: "A heavenly weaver and an earthly cowherd are separated by the Milky Way but meet once a year." },
  { id: "22", assetId: 22, title: "The Monkey King: Journey to the West", region: "China", summary: "Sun Wukong, a powerful monkey, learns humility and protects a monk on a dangerous journey." },
  { id: "23", assetId: 23, title: "Chang’e and the Moon Festival", region: "China", summary: "Hou Yi saves the world from ten suns, but his wife Chang'e floats to the moon after drinking an elixir." },
  { id: "24", assetId: 24, title: "The Butterfly Lovers", region: "China", summary: "Zhu Yingtai and Liang Shanbo's tragic love ends with them transforming into butterflies." },
  { id: "25", assetId: 25, title: "The Legend of Mulan", region: "China", summary: "Mulan disguises herself as a man to take her father's place in war, becoming a hero." },
  { id: "26", assetId: 26, title: "The Painted Skin", region: "China", summary: "A scholar and a magical painter trap a jealous spirit inside a painting." },
  { id: "27", assetId: 27, title: "The Old Man Who Moved the Mountain", region: "China", summary: "Yu Gong's determination to move mountains inspires the gods to help him finish the task." },
  { id: "28", assetId: 28, title: "The Magic Paintbrush", region: "China", summary: "Ma Liang uses a magic brush to help the poor and outwit a greedy ruler." },
  { id: "29", assetId: 29, title: "The Four Dragons", region: "China", summary: "Four dragons disobey the Emperor to bring rain to the people, transforming into China's great rivers." },
  { id: "30", assetId: 30, title: "The Fox Spirit Who Helped a Scholar", region: "China", summary: "A kind fox spirit helps a scholar pass his exams and protects him from jealous rivals." },
  { id: "31", assetId: 31, title: "The Monkey and the Crocodile", region: "India", summary: "A clever monkey outsmarts a crocodile who wants to eat his heart." },
  { id: "32", assetId: 32, title: "The Elephant and the Sparrows", region: "India", summary: "Small animals work together to defeat a bully elephant who destroyed a sparrow's nest." },
  { id: "33", assetId: 33, title: "Tenali Raman and the Thief", region: "India", summary: "Tenali Raman tricks thieves into watering his garden while they think they are stealing treasure." },
  { id: "34", assetId: 34, title: "The Tiger, the Brahmin, and the Jackal", region: "India", summary: "A jackal tricks an ungrateful tiger back into a cage to save a kind Brahmin." },
  { id: "35", assetId: 35, title: "Akbar and Birbal: The Mango Tree", region: "India", summary: "Birbal uses a mango seed to teach Emperor Akbar a lesson about patience and effort." },
  { id: "36", assetId: 36, title: "The Honest Woodcutter", region: "India", summary: "A river goddess rewards a woodcutter for his honesty with golden and silver axes." },
  { id: "37", assetId: 37, title: "The Four Friends and the Hunter", region: "India", summary: "A turtle, deer, crow, and mouse use their unique skills to save each other from a hunter." },
  { id: "38", assetId: 38, title: "The Magic Pot", region: "India", summary: "A magic pot feeds a family but overflows when a curious girl forgets the magic word." },
  { id: "39", assetId: 39, title: "The Story of Savitri and Satyavan", region: "India", summary: "Savitri uses her wit to trick the god of death into returning her husband's life." },
  { id: "40", assetId: 40, title: "The Clever Princess", region: "India", summary: "A wise princess solves a dispute over a necklace by testing who truly cares for it." },
  { id: "41", assetId: 41, title: "Momotaro: The Peach Boy", region: "Japan", summary: "A boy born from a peach teams up with animals to defeat ogres and save his village." },
  { id: "42", assetId: 42, title: "The Green Frog Who Wouldn’t Listen", region: "Korea", summary: "A disobedient frog learns a hard lesson about listening to his mother too late." },
  { id: "43", assetId: 43, title: "The Turtle and the Monkey", region: "Philippines", summary: "Turtle outsmarts greedy Monkey to get his fair share of bananas." },
  { id: "44", assetId: 44, title: "The Legend of Malin Kundang", region: "Indonesia", summary: "A son who denies his poor mother after becoming rich is turned into stone." },
  { id: "45", assetId: 45, title: "The Golden Goby", region: "Vietnam", summary: "A magic fish helps a poor fisherman find justice against a greedy landlord." },
  { id: "46", assetId: 46, title: "The Mouse Deer and the Tiger", region: "Malaysia", summary: "Tiny Mouse Deer tricks Tiger into falling into a pond to escape being eaten." },
  { id: "47", assetId: 47, title: "The Story of the Two Sisters", region: "Cambodia", summary: "A kind sister is rewarded by a magic tree, while her greedy sister gets a muddy surprise." },
  { id: "48", assetId: 48, title: "The Four Harmonious Friends", region: "Tibet / Mongolia", summary: "Four animals learn that respecting elders and working together brings fruit to everyone." },
  { id: "49", assetId: 49, title: "The Wise Little Hen", region: "Thailand", summary: "Hen plants rice alone while her friends play, teaching them that rewards require work." },
  { id: "50", assetId: 50, title: "The Princess and the Demon Snake", region: "Nepal", summary: "A prince uses wisdom to defeat a demon snake and rescue his princess." },
  { id: "51", assetId: 51, title: "The First Fire", region: "Cherokee – USA", summary: "Tiny Water Spider bravely brings fire to the animals after bigger birds fail." },
  { id: "52", assetId: 52, title: "The Great Bear", region: "Iroquois – Canada/US", summary: "Hunters chasing a bear into the sky become the stars of the Big Dipper." },
  { id: "53", assetId: 53, title: "The Story of the Hummingbird", region: "Aztec – Mexico", summary: "A fallen warrior becomes a hummingbird to continue watching over his people." },
  { id: "54", assetId: 54, title: "La Llorona", region: "Mexico", summary: "A gentle retelling of the river spirit who warns children to stay safe near water." },
  { id: "55", assetId: 55, title: "The Magic Snake", region: "Maya – Guatemala", summary: "A farmer helps a snake and is rewarded with wisdom to survive a drought." },
  { id: "56", assetId: 56, title: "The Rainbow Crow", region: "Lenape – N. America", summary: "Crow sacrifices his colorful feathers to bring fire to his freezing friends." },
  { id: "57", assetId: 57, title: "How the Jaguar Lost His Voice", region: "Brazil – Tupi", summary: "Jaguar loses his loud roar after bullying others and learns to be a quiet hunter." },
  { id: "58", assetId: 58, title: "The Condor and the Shepherd Girl", region: "Andes – Peru/Bolivia", summary: "A girl visits the sky kingdom but returns to earth, keeping a feather as a memory." },
  { id: "59", assetId: 59, title: "The Sun and the Moon", region: "Inuit – Arctic", summary: "A brother and sister become the Sun and Moon to light the dark Arctic nights." },
  { id: "60", assetId: 60, title: "The Magic Lake", region: "Andean – Ecuador", summary: "A boy and a magic lake spirit save a village from drought by promising to protect nature." }
];

// 1. Generate a list of stories
export const generateStoryList = async (): Promise<Story[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return [...STORY_CATALOG];
};

// 2. Generate Story Content (Pages)
export const generateStoryContent = async (title: string, region: string, summary?: string): Promise<StoryPage[]> => {
  // Find the story in the catalog to get its assetId
  const story = STORY_CATALOG.find(s => s.title === title);
  
  if (story && STATIC_STORY_CONTENT[story.assetId.toString()]) {
    // Return hardcoded content immediately
    return [...STATIC_STORY_CONTENT[story.assetId.toString()]];
  }

  // Fallback to AI if not found (should not happen with this catalog)
  const context = summary ? `The story is about: ${summary}` : "";
  
  const prompt = `Write a children's story titled "${title}" from ${region}. ${context}
  Split the story into 3 to 7 pages, depending on the complexity required to tell it effectively.
  For each page, provide the story text (max 40 words), a visual description for an illustrator (emphasize silhouettes and layers), and a fun short historical or cultural fact related to the story context.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            visualDescription: { type: Type.STRING },
            historyFact: { type: Type.STRING },
          },
          required: ["text", "visualDescription", "historyFact"],
        },
      },
    },
  });

  if (response.text) {
    return JSON.parse(response.text) as StoryPage[];
  }
  throw new Error("Failed to generate story content");
};

// 3. Generate Image for a page with CACHING and STRICT STYLE
export const generatePageImage = async (visualDescription: string): Promise<string | null> => {
  const cacheKey = `img_${btoa(visualDescription.slice(0, 30))}`; 

  try {
    const cached = await getCachedImage(cacheKey);
    if (cached) {
      console.log("Using cached image");
      return cached;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: `Create a stunning, digital colorful paper-cut illustration. ${visualDescription}. ${PAPER_CUT_STYLE_PROMPT}`,
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64Image = `data:image/png;base64,${part.inlineData.data}`;
        // Try caching, but if it fails (offline db error), just proceed with returning image
        try {
            await cacheImage(cacheKey, base64Image);
        } catch (e) {
            console.warn("Failed to cache image", e);
        }
        return base64Image;
      }
    }
  } catch (error) {
    console.error("Image generation failed", error);
  }
  return null;
};

// 4. Generate Image for a history fact with CACHING
export const generateHistoryImage = async (fact: string): Promise<string | null> => {
  const cacheKey = `hist_${btoa(fact.slice(0, 30))}`;

  try {
    const cached = await getCachedImage(cacheKey);
    if (cached) return cached;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: `Create a clear, educational, colorful layered paper-cut style illustration explaining this fact: "${fact}". ${PAPER_CUT_STYLE_PROMPT}`,
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64Image = `data:image/png;base64,${part.inlineData.data}`;
        try {
            await cacheImage(cacheKey, base64Image);
        } catch (e) {
            console.warn("Failed to cache history image", e);
        }
        return base64Image;
      }
    }
  } catch (error) {
    console.error("History image generation failed", error);
  }
  return null;
};

// 5. Generate Audio (TTS)
export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: {
        parts: [{ text: text }],
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" }, 
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("Speech generation failed", error);
    return null;
  }
};
