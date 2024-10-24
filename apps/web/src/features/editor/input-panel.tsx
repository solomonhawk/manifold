import { useAtomValue, useSetAtom } from "jotai";
import {
  type ChangeEvent,
  type RefObject,
  useCallback,
  useEffect,
} from "react";

import { currentTableHash, currentTableMetadata, tableError } from "./state";
import { workerInstance } from "./worker";

type Props = {
  textAreaRef: RefObject<HTMLTextAreaElement>;
};

export function InputPanel({ textAreaRef }: Props) {
  const error = useAtomValue(tableError);

  const setTableHash = useSetAtom(currentTableHash);
  const setError = useSetAtom(tableError);
  const setTableMetadata = useSetAtom(currentTableMetadata);

  const parseAndValidate = useCallback(
    async function parseAndValidate(value: string) {
      try {
        if (value) {
          const { hash, metadata } = await workerInstance.parse(value);

          setTableHash(hash);
          setTableMetadata(metadata);
        } else {
          setTableHash(null);
          setTableMetadata([]);
        }

        setError(null);
      } catch (e: unknown) {
        console.error(e);
        setError(String(e));
      }
    },
    [setError, setTableHash, setTableMetadata],
  );

  const handleChange = useCallback(
    function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
      parseAndValidate(e.target.value.trim());
    },
    [parseAndValidate],
  );

  // @NOTE: When we move data loading to the router, we may still have to do
  // something like this, but for now this just makes it easier to test things
  // with a default textarea value.
  useEffect(() => {
    parseAndValidate(potionDefinition);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- only run once

  return (
    <>
      <textarea
        ref={textAreaRef}
        name="tabol-definition"
        className="w-full flex-1 p-16 font-mono text-sm resize-none bg-background"
        onChange={handleChange}
        defaultValue={potionDefinition}
      ></textarea>

      {error && (
        <span className="p-4 line-clamp-5 overflow-auto text-sm bg-destructive font-semibold">
          {error}
        </span>
      )}
    </>
  );
}

const potionDefinition = `---
title: Potion
id: potion
export: true
---
1: {{potion_descriptor|indefinite|capitalize}} {{color}} {{potion_substance}} {{containment}} {{container_descriptor|indefinite}} {{container_shape}} {{container_material}} {{container_type}}. It smells like {{smell}} and {{potion_attribute}}. {{potion_effect}}

---
title: Containment
id: containment
---
1: contained within
1: trapped in
1: sloshing around in
1: held by
1: delicately stirring within
1: bubbling within
1: floating in
1: suspended in
1: swirling within
1: resting in

---
title: Potion Descriptor
id: potion_descriptor
---
1: fresh
1: ripe
1: stale
1: brand new
1: questionable
1: vibrant
1: musty
1: ancient
1: old
1: whimsical
1: translucent
1: fiery
1: swirling
1: iridescent
1: mysterious
1: shimmering
1: dark
1: brilliant
1: sparkling
1: glowing
1: dull
1: cloudy
1: clear
1: viscous
1: thick
1: hazy
1: spotty
1: bubbly
1: effervescent
1: frothy
1: foamy
1: oily
1: slimey
1: milky
1: sludgy

---
title: Color
id: color
---
1: red
1: orange
1: yellow
1: green
1: blue
1: purple
1: pink
1: black
1: white
1: multi-colored
1: chromatic
1: {{color}}-{{color}}
1: pale {{color}}
1: light {{color}}
1: dark {{color}}
1: gold
1: silver
1: magenta
1: cyan
1: turquoise
1: jade
1: amber
1: olive
1: amethyst
1: emerald
1: ruby
1: sunflower
1: aquamarine
1: sapphire
1: vermillion
1: lilac
1: indigo
1: violet
1: teal
1: chartreuse
1: maroon

---
title: Potion Substance
id: potion_substance
---
5: liquid
2: gelatin
1: goo
1: sludge
1: mist
1: vapor
1: syrup
1: foam

---
title: Container Descriptor
id: container_descriptor
---
1: twisted
1: jagged
1: small
1: large
1: delicate
1: master-crafted
1: pock-marked
1: cracked
1: smooth
1: ornate
1: simple
1: engraved
1: etched
1: painted

---
title: Container Material
id: container_material
---
5: glass
2: crystal
1: obsidian
1: seashell
1: clay
1: wood
1: metal
1: bone

---
title: Container Shape
id: container_shape
---
1: round
1: spherical
1: rectangular
1: tear-shaped
1: circular
1: triangular
0.7: long and narrow
1: tall
0.7: double-spouted
1: thin-rimmed
1: crystalline
1: hexagonal
1: {{3d4}}-dimensional

---
title: Container Type
id: container_type
---
1: vial
1: bottle
1: flask
1: jar
1: jug
1: decanter
1: beaker
1: bowl
0.5: cauldron
1: chalice
1: phial
1: orb
1: prism
1: concoction
1: tonic
1: philter
1: draught
1: elixir

---
title: Smell
id: smell
---
1: roses
1: lavender
1: a foot
1: hay
1: blood
1: garlic
1: beer
1: mead
1: chocolate
1: smoke
1: wet goblin
1: mint
1: a forge
1: lilac and gooseberries
1: a fresh apple pie
1: fresh bread
1: moldy bread
1: starlight
1: happiness
1: family
1: a summer breeze
1: coal
1: boiled sweets
1: death
1: evil
1: sulphur
1: regret
1: grain alcohol
1: vanilla
1: sandalwood
1: lemon
1: {{root_material}}root

---
title: Root Material
id: root_material
---
1: pine
1: oak
1: willow
1: birch
1: apple
1: sage
1: gum
1: ginger

---
title: Attribute
id: potion_attribute
---
1: glows with a dim {{color}} light
1: it shimmers and swirls curiously
1: reminds you of someone you used to know
1: it's warm to the touch
1: it's cold to the touch
1: it roils and bubbles energetically
1: it sparkles with {{color}} flecks
1: it gives off a {{color}} smoke when agitated
1: it's viscous and thick
1: makes you feel {{emotion}}
1: it's a little bit sticky
1: it pops and crackles
1: makes you uneasy when you look at it
1: it seems to be calling you to drink it
1: it longs to be consumed
1: even though you're confident, you're not sure you want to drink it
1: it's troubling to look at
1: it's a little bit slimy
1: resembles a failed science experiment
1: thrums with {{color}} energy
1: vibrates intriguingly
1: it seems ordinary enough
1: it's like nothing you've ever seen before
1: spins lazily on its own
1: you've heard of something like this before
1: when agitated, it hums and whines softly
1: if you close your eyes, it makes you {{emotion}}

---
title: Emotion
id: emotion
---
1: happy
1: sad
1: angry
1: confused
1: scared
1: excited
1: sleepy
1: hungry
1: thirsty
1: lonely
1: loved
1: hated

---
title: Potion Effect
id: potion_effect
---
1: Regular with a slight side effect. {{effect}}. {{side_effect}}.
1: Regular with no side effect. {{effect}}.
1: Regular with a strong side effect, {{effect}}. {{side_effect}}. {{side_effect}}.
1: Minor with a strong side effect. {{effect}}. {{side_effect}}. {{side_effect}}.
1: Minor with a slight side effect. {{effect}}. {{side_effect}}.
1: Major with a strong side effect. {{effect}}. {{side_effect}}. {{side_effect}}.
1: Major with a small side effect. {{effect}}. {{side_effect}}.
1: A poison - almost no positive affect all side effect. {{side_effect}}, {{side_effect}}
1: Temporary but strong and wears off quickly. {{effect}}. {{side_effect}}.
0.1: Seemingly permanent. {{effect}}. {{side_effect}}.

---
title: Effect
id: effect
---
1: Healing. It instantly regenerates some health when drank
1: Vigor. Gives temporary health when drank
1: Vitality. It slowly regenerates health over a period of some hours
1: Might. It gives a bonus to attack rolls after drinking
1: Courage. Gives immunity to fear and some temporary inspiration
1: Giant Strength. It gives the user much more strength
1: Flame Resistance. It gives resistance to fire damage
1: Cold Resistance. It gives resistance to cold damage
1: Necro Resistance. Gives resistance to necrotic damage
1: Radiant Resistance. Gives resistance to radiant damage
1: Stoneskin. Gives resistance to martial damage
1: Acid Resistance. Gives resistance to acid
1: Lightning Resistance. Gives resistance to lightning damage
1: Succubus Charm. Makes the drinker irresistible to nearby people
1: Shielding. Gives the user a magical shield of energy
1: Flame Breath. Gives the user fire breath for a short time
1: Growth. Makes the user double in size
1: Shrinking. Makes the user half in size
1: Comprehension. Lets the user understand all languages
1: Fertility. Makes the user very fertile, almost certain to make a baby under its effects!
1: Intimidation. Gives the user a huge booming voice that terrifies those around
1: Luck. It gives the user a temporary boost to luck
1: Mana. Gives the user more magical power to cast with
1: Arcane. Gives the user more powerful spells
1: Animal form. Makes the user turn into a random animal
1: Dreams. Makes the user get lost in a hallucinary dream world of their perfect dream
1: Nightmares. Makes the user get lost in a hallucinary dream world of their worst nightmares
1: Stamina. Gives the user more stamina and constitution
1: Fleet foot. Makes the user have more speed
1: Knowledge. Increases the users intelligence temporarily
1: The Bard. Increases the users temporarily
1: Disguise. Changes the users form to a disguised form of any race and appeance
1: Feast. Removes all hunger and thirst from the target
1: Youth. Makes the user grow some years younger
1: Age. Makes the user grow some years older
1: Furnace. Makes the user radiate with a damaging aura
1: Eagle Sight. Gives the user strong vision and a bonus to perception
1: Health. Cures all diseases and illnesses
1: Invulnerability. Freezes the user in stasis that makes them immune to damage but they cannot move or act
1: Riddle me gone. Gives the user the cure to a single riddle
1: Horrifying appearance. Makes the user look more ugly for a time
1: Beautiful appearance. Makes the user appear more attractive for a time
1: Swordsmanship. Makes the user more effective and versatile with a blade
1: Bowmanship. Makes the user more effective with a bow or ranged weapon
1: Nymph Breath. Gives water breathing
1: Midas. Makes the user turn things to gold
1: Berserker. Makes the user rage with great strength
1: Utter Hatred. Makes the user have bonuses against a particular type of enemy
1: Oracle. Lets the user divinate the future
1: Demonic Leech. Heals a portion of all damage the user deals
1: Fey Nature. Lets the user become one with animals and nature around them
1: Tracelessness. Makes the user very hard to follow
1: Gracefulness. Makes the user have a better acrobatics skill
1: Goblin Climb. Gives the user a bonus to climbing
1: Dead Ringer. Makes the user appear completely dead to all magic
1: One Leafed Clover. Gives the user worst luck
1: Possession. Lets the user gain control of a nearby creature, their body comatosed while they do
1: Owls Wake. Makes the user need no sleep for a time
1: Hawks Flight. Lets the user fly
1: Peace. Makes the user very calm and unable to harm others
1: Rejuvenation. Heals a single scar or bad injury on the user such as a missing arm
1: Sphinxes Truth. Makes the user tell the truth
1: Serpent Tongue. Makes the user only able to lie
1: Navigation. Makes the user unable to get lost and find where they need
1: Hook Horror. The users hands become sharp weaponised blades
1: Schaffensfreude. Makes the enemies take damage as they deal it to the user
1: Invisibility. Makes the user invisible
1: Wild magic. Taps into wild magic making an absolutely random thing happen
1: Fame. Makes the user more famous
1: Goats Trek. Makes the user immune to the toils of long travels and bad weather
1: Gargoyle Toughness. Increases the users constitution
1: Atomic Clock. Lets the user know the exact tme and date
1: Transmutation. Lets the user have the ability to change somethings properties
1: Iron Skin. Turns the users skin to metal giving them many resistances
1: Sex Change. Changes the users gender
1: Race Change. Changes the users race
1: Musical Breath. Makes the user say everything in song, and fey music follows them in the air
1: Utter Understanding. Makes the user know very intimately about one exact thing. Random, or they can decide
1: Split Form. The user turns into two or three tiny versions of themselves and controls them all
1: Flavour. Makes anything and everything taste amazing!
1: Glimmer. Makes the user and its gear instantly clean and as good looking as possible
1: Love. Makes the user and someone else fall in love
1: Poison. Poisons the user, weakening them
1: Rebirth. Resurrects the user if they die soon after drinking
1: Elemental form. Turns the user to an elemental form relevant to their personality
1: True form. Turns the user into a familiar like creature similar to their personality
1: Gods Touch. Gives the user a holy connection to their god or fiendish deity
1: Antidepressant. Does what it says on the tin
1: Ghostly Form. Makes the user intangible and able to phase through objects
1: Artisans Skill. Gives the user skill in a particular art temporarily
1: Godly form. Improves all stats
1: Bless Weapon. Makes the users weapons do more damage
1: Euphoria. Makes the user feel amazing and trip out
1: Bodyguard. Creates a spectral bodyguard for a short time who obeys orders
1: Babelfish. Lets the user speak any language but not understand it
1: Preservation. Stops whatever its poured on from rotting or degrading
1: Fear. Makes the user terrified
1: Night vision. Gives the ability to see in the dark
1: Tracking. Lets the user track an enemy
1: Cure-all. Cures any status effects

---
title: Side Effect
id: side_effect
---
1: Nothing bad at all
1: Puts the user to sleep
1: Rapid hair growth all over the body
1: Bleeding from the eyes
1: Vivid hallucinations
1: Flashbacks of your own eventual demise
1: The skin to crack and appear distorted
1: Spots to grow on the skin
1: Diarrhoea
1: Vomiting
1: Blurred Vision
1: Blindness
1: Deafness
1: Mutism
1: Health loss via rapid bleeding
1: A sudden horrific accent
1: The irresistible urge to dance
1: The hearing of demons
1: Loss of balance
1: Everything tasting like dirt for some time
1: Excessive drooling
1: Loss of intelligence
1: Loss of strength
1: Loss of speed
1: Loss of charisma
1: Genuine happiness
1: Hunger
1: Thirst
1: Trouble breathing
1: Sudden Moustache
1: Poisoning
1: Petrification
1: Stunning
1: Immobilisation
1: Increased libido
1: Fidgeting
1: Itchiness
1: Rashes
1: Attracts bears
1: Magically covers in dirt
1: Horrifying stench
1: Baldness
1: Swelling
1: Loss of a random item
1: Curses
1: Damage
1: Weakness to a {{magical_damage_type}}
1: Weakness to physical damage
1: Feelings of Guilt
1: Feelings of Anxiety
1: Feelings of Shame
1: Sneezing
1: Uncontrollable crying
1: Need to sing heroic music
1: Urge to hug
1: Kleptomania
1: Burping
1: Loss of smell
1: Insomnia
1: Paranoia
1: Bad luck
1: Summons imps that want to kill you
1: Summons angry bees
1: Fear of something
1: Temporary madness
1: Relaxation
1: Appreciation of colours and sound
1: Tripping the hell out
1: Painful lust
1: Light headedness
1: Increased confidence
1: Recklessness
1: Rage
1: Sadness
1: Dizziness
1: Pain
1: Slight possession
1: Allergic reaction to your favourite food
1: Strong believe you’re someone else
1: Severe debt
1: Grumpiness
1: Muscle spasms
1: A bloated feeling
1: A cold
1: A fever
1: Becoming strangely light
1: Weakness
1: The urge to fight
1: The need to make friends
1: Nausea
1: Mood swings
1: Addiction
1: Need for booze
1: Drunkeness
1: Coughing
1: Uncontrollable babbling
1: Slight aches
1: A bad taste for some time
1: Giddiness
1: Laughter

---
title: Magical Damage Types
id: magical_damage_type
---
1: acid
1: bludgeoning
1: cold
1: fire
1: force
1: lightning
1: necrotic
1: piercing
1: poison
1: psychic
1: radiant
1: slashing
1: thunder`;
