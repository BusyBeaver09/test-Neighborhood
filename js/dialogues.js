// Dialogue data structure for Maplewood Lane
const DIALOGUES = {
    // Mrs. Finch dialogues
    "mrs_finch": {
        name: "Mrs. Finch",
        portrait: "portrait-mrs-finch",
        // Add trust reactions
        trustReactions: {
            tier_suspicious: "mrs_finch_suspicious_reaction",
            tier_cautious: "mrs_finch_cautious_reaction",
            tier_confiding: "mrs_finch_confiding_reaction",
            tier_vulnerable: "mrs_finch_vulnerable_reaction",
            trust_gained: "mrs_finch_trust_gained",
            trust_lost: "mrs_finch_trust_lost"
        },
        // Trust reaction dialogues
        mrs_finch_suspicious_reaction: {
            text: "[She eyes you warily] Back again? I'm not sure what you want from me, but I'll be keeping my distance.",
            options: [
                {
                    text: "I just wanted to check in on you.",
                    next: "default",
                    trustChange: 2
                },
                {
                    text: "I'll leave you alone.",
                    next: "exit"
                }
            ]
        },
        mrs_finch_cautious_reaction: {
            text: "I've been thinking about what we've discussed. Perhaps I was too quick to judge you.",
            options: [
                {
                    text: "I appreciate that, Mrs. Finch.",
                    next: "default",
                    trustChange: 3
                },
                {
                    text: "What made you change your mind?",
                    next: "mrs_finch_reconsider"
                }
            ]
        },
        mrs_finch_confiding_reaction: {
            text: "[She smiles warmly] Oh, I'm glad you're here. I was just thinking about something else I remembered about that night.",
            options: [
                {
                    text: "I'd love to hear about it.",
                    next: "mrs_finch_memory",
                    trustChange: 2
                },
                {
                    text: "Actually, I had some other questions.",
                    next: "default"
                }
            ]
        },
        mrs_finch_vulnerable_reaction: {
            text: "[She takes your hand] Elia, I've come to trust you completely. There's something I need to show you... something I've kept hidden about Iris.",
            options: [
                {
                    text: "What is it, Mrs. Finch?",
                    next: "mrs_finch_revelation",
                    trustChange: 5
                }
            ]
        },
        mrs_finch_trust_gained: {
            text: "[She looks at you with a bit more warmth] I must say, you remind me a bit of Iris. She was always respectful too.",
            options: [
                {
                    text: "Thank you, that means a lot.",
                    next: "default",
                    trustChange: 1
                },
                {
                    text: "Tell me more about Iris.",
                    next: "mrs_finch_iris"
                }
            ]
        },
        mrs_finch_trust_lost: {
            text: "[Her expression hardens] I thought we understood each other better than this, Elia.",
            options: [
                {
                    text: "I'm sorry if I upset you.",
                    next: "default",
                    trustChange: 1
                },
                {
                    text: "Let's just move on.",
                    next: "default"
                }
            ]
        },
        // Memory that unlocks at Confiding trust tier
        mrs_finch_memory: {
            text: "That night... I didn't tell the police everything. I saw shadows moving between the houses. Not people-shaped, more like... [she gestures vaguely] flowing darkness. I thought I was imagining things, but then Iris mentioned seeing them too, in her journal.",
            options: [
                {
                    text: "Her journal? Do you have it?",
                    next: "mrs_finch_journal",
                    trustChange: 2
                },
                {
                    text: "Have you seen these shadows since?",
                    next: "mrs_finch_shadows_since"
                }
            ],
            givesClue: "Mrs. Finch saw flowing shadow figures the night Iris disappeared"
        },
        // Secret revelation at Vulnerable trust tier
        mrs_finch_revelation: {
            text: "[She leads you to a bookshelf and removes a false back, pulling out a small leather journal] This was Iris's research journal. I... I took it from her house before the police arrived. I was afraid of what they might do with the information inside.",
            options: [
                {
                    text: "May I see it?",
                    next: "mrs_finch_gives_journal",
                    trustChange: 2
                },
                {
                    text: "Why did you hide this?",
                    next: "mrs_finch_hiding_reason"
                }
            ],
            givesClue: "Mrs. Finch hid Iris's research journal from police"
        },
        mrs_finch_gives_journal: {
            text: "Here. [She hands you the journal] Be careful with this knowledge, Elia. Some things in Maplewood Lane were better left undisturbed. Iris didn't understand that until it was too late.",
            options: [
                {
                    text: "Thank you for trusting me with this.",
                    next: "exit",
                    trustChange: 5,
                    setFlag: "has_iris_journal=true"
                }
            ],
            givesClue: "Iris's journal - 'Some things in Maplewood Lane were better left undisturbed'"
        },
        // Default greeting with trust-based variants
        default_variants: [
            {
                nodeId: "default_suspicious",
                trustTier: "Suspicious",
                minTrust: 0
            },
            {
                nodeId: "default_cautious",
                trustTier: "Cautious",
                minTrust: 11
            },
            {
                nodeId: "default_confiding",
                trustTier: "Confiding",
                minTrust: 31
            },
            {
                nodeId: "default_vulnerable",
                trustTier: "Vulnerable",
                minTrust: 61
            }
        ],
        default_suspicious: {
            text: "[Mrs. Finch eyes you suspiciously from her porch] Yes? What do you want?",
            options: [
                {
                    text: "I'm Elia. I'm looking into what happened to Iris Bell.",
                    next: "mrs_finch_iris_suspicious"
                },
                {
                    text: "I used to live in the neighborhood. Just saying hello.",
                    next: "mrs_finch_greeting_suspicious"
                },
                {
                    text: "Never mind, sorry to bother you.",
                    next: "exit"
                }
            ]
        },
        default_cautious: {
            text: "[Mrs. Finch nods politely] Hello again, Elia. What can I help you with today?",
            options: [
                {
                    text: "I wanted to ask more about Iris.",
                    next: "mrs_finch_iris_cautious" 
                },
                {
                    text: "Have you noticed anything unusual in the neighborhood lately?",
                    next: "mrs_finch_unusual_cautious"
                },
                {
                    text: "Just checking in. How are you doing?",
                    next: "mrs_finch_greeting_cautious",
                    trustChange: 2
                }
            ]
        },
        default_confiding: {
            text: "[Mrs. Finch smiles warmly] Elia, it's good to see you. Come sit on the porch with me for a bit.",
            options: [
                {
                    text: "I'd like to discuss what you remember about the night Iris disappeared.",
                    next: "mrs_finch_iris_night_confiding" 
                },
                {
                    text: "Have you been feeling safe? Any strange occurrences?",
                    next: "mrs_finch_safety_confiding"
                },
                {
                    text: "How have you been, Mrs. Finch?",
                    next: "mrs_finch_greeting_confiding",
                    trustChange: 1
                }
            ]
        },
        default_vulnerable: {
            text: "[Mrs. Finch embraces you briefly] Oh, Elia. I'm so glad you're here. I've been thinking about what we discussed.",
            options: [
                {
                    text: "Any new thoughts about Iris's research?",
                    next: "mrs_finch_research_vulnerable" 
                },
                {
                    text: "Have you seen those shadow figures again?",
                    next: "mrs_finch_shadows_vulnerable"
                },
                {
                    text: "I'm just checking in on you, Mrs. Finch.",
                    next: "mrs_finch_greeting_vulnerable",
                    trustChange: 1
                }
            ]
        },
        default: {
            text: "[A elderly woman with sharp eyes watches you approach from her front porch] Hello there, young one. I don't believe I've seen you around Maplewood Lane before.",
            options: [
                {
                    text: "I'm Elia Martinez. I used to live here - I've come back to reconnect with the town.",
                    next: "mrs_finch_intro"
                },
                {
                    text: "I'm looking into what happened to Iris Bell. Did you know her?",
                    next: "mrs_finch_iris"
                },
                {
                    text: "Just exploring the neighborhood. It seems quiet here.",
                    next: "mrs_finch_quiet"
                },
                {
                    text: "Just saying hello. Have a nice day!",
                    next: "mrs_finch_goodbye"
                }
            ]
        },
        // Morning dialogue - Low Trust
        mrs_finch_morning_low_trust: {
            text: "Oh Elia, dear... still snooping around, are you? [She looks you over carefully.] You should be careful what you dig up in this town.",
            options: [
                {
                    text: "I just want to understand what happened to Iris.",
                    next: "mrs_finch_iris",
                    trust: 2
                },
                {
                    text: "Are you warning me about something specific?",
                    next: "mrs_finch_warning",
                    trust: -1
                },
                {
                    text: "I'll be careful. Have a nice day.",
                    next: "mrs_finch_goodbye"
                }
            ],
            mood: "suspicious"
        },
        // Afternoon dialogue - Medium Trust
        mrs_finch_afternoon_medium_trust: {
            text: "You remind me of Iris. Always asking questions. […Too many, if you ask me.]",
            options: [
                {
                    text: "I just want to understand.",
                    next: "mrs_finch_understanding",
                    trust: 5
                },
                {
                    text: "Then tell me what you know.",
                    next: "mrs_finch_demanding",
                    trust: -2,
                    unlocks: "Mrs. Finch becomes defensive when pressed about Iris"
                },
                {
                    text: "What kind of questions was Iris asking?",
                    next: "mrs_finch_iris_questions"
                }
            ],
            mood: "suspicious"
        },
        // Night dialogue - High Trust
        mrs_finch_night_high_trust: {
            text: "That night, the basement light kept flickering. I thought it was just the storm. But I swear, I saw someone... *someone that wasn't Iris.*",
            options: [
                {
                    text: "Could it have been a reflection?",
                    next: "mrs_finch_reflection"
                },
                {
                    text: "Was it a shadow figure?",
                    next: "mrs_finch_shadow",
                    unlocks: "Mrs. Finch may have seen a 'shadow figure' in Iris's basement"
                },
                {
                    text: "Show photo: Flickering Light",
                    next: "mrs_finch_photo_flicker",
                    requirement: { photoRequired: "flickerPhoto" },
                    trust: 10
                }
            ],
            mood: "mysterious"
        },
        mrs_finch_intro: {
            text: "Martinez? Oh my, little Elia! I remember you, though you've grown so much. You were friends with poor Iris, weren't you? Such a shame what happened...",
            options: [
                {
                    text: "What exactly happened to Iris?",
                    next: "mrs_finch_iris"
                },
                {
                    text: "How have things been in the neighborhood lately?",
                    next: "mrs_finch_neighborhood"
                },
                {
                    text: "I'd like to ask about something else.",
                    next: "default"
                }
            ],
            trust: 5,
            clue: "Mrs. Finch mentions 'poor Iris' but doesn't elaborate"
        },
        mrs_finch_understanding: {
            text: "I know, dear. And I appreciate that you're not being... aggressive about it, like some people. [She sighs] I think about Iris often. She used to bring me cookies every Sunday.",
            options: [
                {
                    text: "Did she ever tell you about her concerns or fears?",
                    next: "mrs_finch_iris_fears"
                },
                {
                    text: "I'd like to ask about something else.",
                    next: "default"
                }
            ],
            trust: 3
        },
        mrs_finch_demanding: {
            text: "[She stiffens] Young people these days, so direct. I've told the police everything I know. I'm not hiding anything. [She crosses her arms]",
            options: [
                {
                    text: "I'm sorry, I didn't mean to upset you.",
                    next: "mrs_finch_apology",
                    trust: 1
                },
                {
                    text: "I think you know more than you're telling me.",
                    next: "mrs_finch_accusation",
                    trust: -5
                },
                {
                    text: "I'd like to ask about something else.",
                    next: "default"
                }
            ],
            mood: "suspicious"
        },
        mrs_finch_iris_questions: {
            text: "Oh, all sorts of things. About the town's history, about the well in the park, about why certain houses had been abandoned. She was writing something, I think. A book, maybe. Or a journal.",
            options: [
                {
                    text: "Did she find anything unusual in her research?",
                    next: "mrs_finch_iris_findings",
                    trust: 2
                },
                {
                    text: "What's special about the well in the park?",
                    next: "mrs_finch_well"
                },
                {
                    text: "I'd like to ask about something else.",
                    next: "default"
                }
            ],
            unlocks: "Iris was researching the town's history and abandoned properties"
        },
        mrs_finch_reflection: {
            text: "A reflection? [She looks uncertain] Maybe... but it moved in ways that... [she shakes her head] No, I can't explain it. But I've lived in this town all my life, and I know what I saw wasn't natural.",
            options: [
                {
                    text: "Did you tell anyone else about this?",
                    next: "mrs_finch_told_others"
                },
                {
                    text: "Have you ever seen anything like it since?",
                    next: "mrs_finch_other_sightings"
                },
                {
                    text: "I'd like to ask about something else.",
                    next: "default"
                }
            ]
        },
        mrs_finch_shadow: {
            text: "[Her eyes widen] That's... how did you know about... [She lowers her voice] Yes. It was like a person, but not. Too tall, too thin. And it moved... wrong. Like it was flowing rather than walking. Iris had drawn something like it in her notebook once.",
            options: [
                {
                    text: "Camille draws similar figures. Did Iris talk to her about them?",
                    next: "mrs_finch_camille_connection",
                    requirement: { clue: "Camille draws shadow figures, says 'Iris used to talk to them'" }
                },
                {
                    text: "Do you think this... thing had something to do with Iris disappearing?",
                    next: "mrs_finch_shadow_theory"
                },
                {
                    text: "I'd like to ask about something else.",
                    next: "default"
                }
            ],
            trust: 8,
            unlocks: "Shadow figures described by multiple witnesses"
        },
        mrs_finch_photo_flicker: {
            text: "[She stares at your photo, her hand trembling slightly] That's... that's exactly what I saw. The lights, flickering in that pattern. And then the shadow crossing behind the window. You've seen it too, then. [She seems both relieved and frightened] So I'm not crazy after all.",
            options: [
                {
                    text: "When was the last time you saw this happen?",
                    next: "mrs_finch_last_sighting"
                },
                {
                    text: "Do you think whatever this is might still be in that house?",
                    next: "mrs_finch_still_there"
                },
                {
                    text: "I'd like to ask about something else.",
                    next: "default"
                }
            ],
            trust: 15,
            unlocks: "The basement light phenomenon continues to this day"
        },
        mrs_finch_iris_fears: {
            text: "She did seem... anxious in those last weeks. She told me she felt like she was being watched. At first I thought it was just nerves from her research, but now I wonder.",
            options: [
                {
                    text: "Watched by whom?",
                    next: "mrs_finch_watched"
                },
                {
                    text: "Did she mention any specific incidents?",
                    next: "mrs_finch_incidents"
                },
                {
                    text: "I'd like to ask about something else.",
                    next: "default"
                }
            ],
            trust: 5,
            unlocks: "Iris felt she was being watched in the weeks before her disappearance"
        },
        mrs_finch_goodbye: {
            text: "Take care, dear! And be careful wandering around after dark. Not that anything would happen, of course, but... well, just be careful.",
            options: [
                {
                    text: "End conversation",
                    next: "exit"
                }
            ]
        },
        // More Mrs. Finch dialogue nodes...
    },
    
    // Jake and Lila dialogues
    "jake_lila": {
        name: "Jake & Lila",
        portrait: "portrait-jake-lila",
        default: {
            text: "Hey there! You must be new around here. I'm Jake, this is my wife Lila. We moved into this house about five months ago.",
            options: [
                {
                    text: "I'm Elia Martinez. I actually grew up here but moved away years ago.",
                    next: "jake_lila_returning"
                },
                {
                    text: "This used to be Iris Bell's house, right? What happened to her?",
                    next: "jake_lila_iris"
                },
                {
                    text: "How do you like living in Quiet Hollow?",
                    next: "jake_lila_opinion"
                },
                {
                    text: "Just saying hello. Take care!",
                    next: "jake_lila_goodbye"
                }
            ]
        },
        jake_lila_returning: {
            text: "[Lila] Martinez? Wait, you're related to Iris, aren't you? [Jake gives her a concerned look] I mean, we heard about Iris from the neighbors. We never met her ourselves.",
            options: [
                {
                    text: "She was my cousin. Do you know what happened to her?",
                    next: "jake_lila_iris"
                },
                {
                    text: "You seem nervous about Iris. Why is that?",
                    next: "jake_lila_nervous",
                    requirement: { trust: 20 }
                },
                {
                    text: "Tell me about how you ended up in this house.",
                    next: "jake_lila_house"
                }
            ],
            trust: 5
        },
        jake_lila_iris: {
            text: "[Jake] From what we heard, she just left town. Young people do that sometimes, right? Just take off without telling anyone. [Lila] We got the house at a foreclosure auction. Really good deal. [She looks uncomfortable]",
            options: [
                {
                    text: "That seems strange. No one knows where she went?",
                    next: "jake_lila_whereabouts"
                },
                {
                    text: "Do you ever notice anything strange in the house?",
                    next: "jake_lila_strange_house"
                },
                {
                    text: "I'd like to ask about something else.",
                    next: "default"
                }
            ],
            trust: 10,
            clue: "Jake and Lila claim Iris 'left town'"
        },
        jake_lila_nervous: {
            text: "[Lila] Nervous? No, not at all. It's just... people talk around here. A lot. [Jake] What my wife means is that it's uncomfortable moving into a house when the previous owner disappeared. People make assumptions.",
            options: [
                {
                    text: "What kind of assumptions?",
                    next: "jake_lila_assumptions"
                },
                {
                    text: "Have you found any of Iris's belongings in the house?",
                    next: "jake_lila_belongings"
                },
                {
                    text: "I'd like to ask about something else.",
                    next: "default"
                }
            ],
            trust: 25
        },
        jake_lila_whereabouts: {
            text: "[Jake] The police looked into it, but I guess they didn't find anything suspicious. [Lila] Maybe she just wanted a fresh start somewhere else. Don't we all sometimes?",
            options: [
                {
                    text: "Did either of you ever meet Iris?",
                    next: "jake_lila_met_iris"
                },
                {
                    text: "The police investigation seemed pretty minimal.",
                    next: "jake_lila_police"
                },
                {
                    text: "I'd like to ask about something else.",
                    next: "default"
                }
            ],
            trust: 15
        },
        jake_lila_met_iris: {
            text: "[They exchange glances] [Jake] No, we moved here after she was gone. [Lila] I wish we had though. Everyone says she was interesting.",
            options: [
                {
                    text: "I have a photo that suggests otherwise.",
                    next: "jake_lila_photo_confrontation",
                    requirement: { clue: "Photo of neighbors talking to Iris - timestamped after they claimed she vanished" }
                },
                {
                    text: "What have people told you about her?",
                    next: "jake_lila_hearsay"
                },
                {
                    text: "I'd like to ask about something else.",
                    next: "default"
                }
            ],
            trust: 20
        },
        jake_lila_photo_confrontation: {
            text: "[Both look visibly shocked] [Jake] Where did you get that? [Lila] That's... that's not what it looks like. We did meet her, once. But it was before she disappeared. The timestamp must be wrong.",
            options: [
                {
                    text: "Why lie about knowing her?",
                    next: "jake_lila_confession"
                },
                {
                    text: "What were you talking about with her in this photo?",
                    next: "jake_lila_conversation"
                },
                {
                    text: "I think I've heard enough lies for now.",
                    next: "jake_lila_leave"
                }
            ],
            trust: -10
        },
        jake_lila_opinion: {
            text: "[Lila] It's very peaceful here. Everyone's been welcoming. [Jake] Mostly. Some of the older residents are a bit... set in their ways. But we're making it our home.",
            options: [
                {
                    text: "Have you met all the neighbors?",
                    next: "jake_lila_neighbors"
                },
                {
                    text: "Did you know the previous owner of this house?",
                    next: "jake_lila_iris"
                },
                {
                    text: "I'd like to ask about something else.",
                    next: "default"
                }
            ],
            trust: 5
        },
        jake_lila_goodbye: {
            text: "Nice meeting you! Stop by anytime... well, maybe call first. [They laugh awkwardly]",
            options: [
                {
                    text: "End conversation",
                    next: "exit"
                }
            ]
        },
        // More Jake and Lila dialogue nodes...
    },
    
    // Mr. Arnold dialogues - updating with time and trust-based formats
    "mr_arnold": {
        name: "Mr. Arnold",
        portrait: "portrait-mr-arnold",
        default: {
            text: "What do you want? I'm busy. [He eyes you suspiciously] You're not another reporter, are you?",
            options: [
                {
                    text: "I'm Elia Martinez. I used to live in this neighborhood.",
                    next: "mr_arnold_returning"
                },
                {
                    text: "I'm looking into what happened to Iris Bell.",
                    next: "mr_arnold_iris"
                },
                {
                    text: "Just being friendly with the neighbors.",
                    next: "mr_arnold_friendly"
                },
                {
                    text: "Sorry to bother you. I'll go.",
                    next: "mr_arnold_goodbye"
                }
            ]
        },
        // Low trust night dialogue
        mr_arnold_night_low_trust: {
            text: "[You find Mr. Arnold standing in his yard, staring at the abandoned house] What are you doing out this late? Nothing good happens after dark in this town. [He continues staring without looking at you]",
            options: [
                {
                    text: "What are you looking at?",
                    next: "mr_arnold_watching"
                },
                {
                    text: "Have you seen anything unusual tonight?",
                    next: "mr_arnold_unusual_sighting"
                },
                {
                    text: "I'll leave you alone.",
                    next: "mr_arnold_goodbye"
                }
            ],
            mood: "mysterious"
        },
        // Medium trust evening dialogue
        mr_arnold_evening_medium_trust: {
            text: "[Mr. Arnold is cleaning an old flashlight] The abandoned house... Sometimes I see the basement lights turn on. Nobody's lived there since Iris... [he pauses] I keep watch, you know.",
            options: [
                {
                    text: "Why do you watch that house?",
                    next: "mr_arnold_watching_reason",
                    trust: 5
                },
                {
                    text: "You mentioned seeing Iris the night she disappeared. Did you approach her?",
                    next: "mr_arnold_last_sighting_detail",
                    trust: 3
                },
                {
                    text: "Show photo: Basement Light",
                    next: "mr_arnold_basement_photo",
                    requirement: { photoRequired: "flickerPhoto" },
                    trust: 10
                }
            ],
            mood: "suspicious"
        },
        // High trust night dialogue
        mr_arnold_night_high_trust: {
            text: "[Mr. Arnold hands you a small key] Listen carefully. This opens the utility door to Iris's basement. I've seen them go in there. The things that took her. I've never had the courage to go in myself. [His hands shake] Don't tell anyone I gave you this.",
            options: [
                {
                    text: "Thank you. I'll investigate carefully.",
                    next: "mr_arnold_thanks_key",
                    trust: 10
                },
                {
                    text: "What exactly do these 'things' look like?",
                    next: "mr_arnold_describes_shadows",
                    unlocks: "Mr. Arnold has seen the shadow figures entering Iris's basement"
                },
                {
                    text: "Why give me this now?",
                    next: "mr_arnold_motivation"
                }
            ],
            mood: "mysterious",
            unlocks: "Obtained key to Iris's basement"
        },
        // New detailed dialogue nodes for Mr. Arnold
        mr_arnold_watching: {
            text: "I'm watching for them. [His voice drops to a whisper] The shadows. They move between the houses at night. Everyone thinks I'm crazy, but I know what I've seen.",
            options: [
                {
                    text: "What do these shadows look like?",
                    next: "mr_arnold_describes_shadows"
                },
                {
                    text: "Does this have something to do with Iris?",
                    next: "mr_arnold_shadows_iris"
                },
                {
                    text: "I'd like to ask about something else.",
                    next: "default"
                }
            ],
            trust: 5,
            unlocks: "Mr. Arnold claims to see 'shadows' moving between houses at night"
        },
        mr_arnold_unusual_sighting: {
            text: "Every night is unusual in this place if you pay attention. [He points to the abandoned house] That place... the basement lights were on again earlier. Just for a few minutes. Like they're... searching for something.",
            options: [
                {
                    text: "Have you told anyone else about this?",
                    next: "mr_arnold_told_others"
                },
                {
                    text: "Have you ever tried to investigate?",
                    next: "mr_arnold_investigate"
                },
                {
                    text: "I'd like to ask about something else.",
                    next: "default"
                }
            ],
            unlocks: "The abandoned house basement lights occasionally turn on at night"
        },
        mr_arnold_watching_reason: {
            text: "[He lowers his voice] Because I feel responsible. I saw her that night, heading toward the well. I should have stopped her. Said something. But I just watched from my window. [His voice becomes strained] And then those... things came. From between the houses. Flowing like... like they weren't solid.",
            options: [
                {
                    text: "What do you mean by 'things'?",
                    next: "mr_arnold_describes_shadows"
                },
                {
                    text: "Did you report this to the police?",
                    next: "mr_arnold_police_report"
                },
                {
                    text: "I'd like to ask about something else.",
                    next: "default"
                }
            ],
            trust: 8,
            unlocks: "Mr. Arnold saw Iris heading to the well the night she disappeared"
        },
        mr_arnold_last_sighting_detail: {
            text: "No. [He looks away] I watched from my window. She was walking with purpose, toward the well. It was raining, but she didn't have an umbrella. Didn't seem to care. Like she was in a trance.",
            options: [
                {
                    text: "What time was this?",
                    next: "mr_arnold_time_detail"
                },
                {
                    text: "Did you see anyone else out that night?",
                    next: "mr_arnold_others_out"
                },
                {
                    text: "I'd like to ask about something else.",
                    next: "default"
                }
            ],
            trust: 5,
            unlocks: "Iris appeared to be in a trance-like state the night she disappeared"
        },
        mr_arnold_basement_photo: {
            text: "[He stares at your photo, his face paling] You've captured it. The lights. [He glances up at you with new respect] Now you know I'm not crazy. They're in there, whatever they are. Searching.",
            options: [
                {
                    text: "How often does this happen?",
                    next: "mr_arnold_frequency"
                },
                {
                    text: "Do you have any idea what they're searching for?",
                    next: "mr_arnold_searching_for"
                },
                {
                    text: "I'd like to ask about something else.",
                    next: "default"
                }
            ],
            trust: 15,
            unlocks: "The basement lights are evidence of an ongoing search by unknown entities"
        },
        mr_arnold_describes_shadows: {
            text: "They're tall. Too tall for a person. And thin, like stretched taffy. No features I could make out. Just... darkness, deeper than the night around them. And they don't walk exactly... more like they flow, or glide. Unnatural. [He shudders]",
            options: [
                {
                    text: "That matches what Camille has drawn.",
                    next: "mr_arnold_camille_connection",
                    requirement: { clue: "Camille draws shadow figures, says 'Iris used to talk to them'" }
                },
                {
                    text: "Have you ever tried to communicate with them?",
                    next: "mr_arnold_communicate"
                },
                {
                    text: "I'd like to ask about something else.",
                    next: "default"
                }
            ],
            trust: 10,
            unlocks: "Detailed description of the shadow entities that haunt Quiet Hollow"
        },
        // Keep other existing nodes
        mr_arnold_returning: {
            text: "Martinez? [His expression softens slightly] Ah, you're related to Iris, aren't you? Tragedy what happened. Or didn't happen. Nobody really knows, do they?",
            options: [
                {
                    text: "What do you think happened to her?",
                    next: "mr_arnold_theory"
                },
                {
                    text: "I heard you saw her the night she disappeared?",
                    next: "mr_arnold_sighting"
                },
                {
                    text: "How well did you know Iris?",
                    next: "mr_arnold_relationship"
                }
            ],
            trust: 5
        },
        mr_arnold_iris: {
            text: "Iris Bell? [He seems uncomfortable] What's there to look into? Girl left town. End of story. The police already went through all this.",
            options: [
                {
                    text: "You don't seem convinced of that yourself.",
                    next: "mr_arnold_skeptical"
                },
                {
                    text: "I heard you were the last person to see her?",
                    next: "mr_arnold_sighting"
                },
                {
                    text: "I'd like to ask about something else.",
                    next: "default"
                }
            ],
            trust: 5
        },
        // Add more dialogue nodes as needed
    },
    
    // Camille dialogues
    "camille": {
        name: "Camille",
        portrait: "portrait-mrs-finch", // Placeholder, would need a proper portrait
        default: {
            text: "[A young girl, about 12, is sitting on a porch swing, drawing intensely in a sketchbook. She looks up as you approach] Oh, hi. Are you new here?",
            options: [
                {
                    text: "I'm Elia. I used to live here when I was younger.",
                    next: "camille_introduction"
                },
                {
                    text: "I'm looking for information about Iris Bell. Did you know her?",
                    next: "camille_iris"
                },
                {
                    text: "What are you drawing there?",
                    next: "camille_drawing"
                },
                {
                    text: "Just saying hi. Have a nice day!",
                    next: "camille_goodbye"
                }
            ]
        },
        camille_introduction: {
            text: "Oh cool! I've only lived here for two years. My mom says this place has 'character', which I think means it's old. [She laughs] I'm Camille.",
            options: [
                {
                    text: "Nice to meet you, Camille. Do you like living here?",
                    next: "camille_opinion"
                },
                {
                    text: "Did you ever meet a girl named Iris who used to live here?",
                    next: "camille_iris"
                },
                {
                    text: "What are you drawing?",
                    next: "camille_drawing"
                }
            ],
            trust: 5
        },
        camille_iris: {
            text: "Iris? Yeah! She was super nice. She used to babysit me sometimes before she... went away. Mom says she moved, but she never said goodbye to me. [She looks sad] She taught me how to draw.",
            options: [
                {
                    text: "What was she like?",
                    next: "camille_iris_personality"
                },
                {
                    text: "Did she ever seem scared or worried before she disappeared?",
                    next: "camille_iris_mood"
                },
                {
                    text: "I'd like to ask about something else.",
                    next: "default"
                }
            ],
            trust: 10
        },
        camille_drawing: {
            text: "[She hesitates, then turns her sketchbook to show you. The page is filled with shadowy, elongated figures lurking between trees and houses] Just some people I see sometimes. Not real people. Well, Iris said they might be real, just not in the way most people think.",
            options: [
                {
                    text: "These are really interesting. Why do you draw these figures?",
                    next: "camille_figures_why"
                },
                {
                    text: "What did Iris tell you about them?",
                    next: "camille_iris_shadows"
                },
                {
                    text: "I'd like to ask about something else.",
                    next: "default"
                }
            ],
            trust: 15
        },
        camille_iris_shadows: {
            text: "She said they were... watchers, I think? She said they've always been here, but most people forget how to see them when they grow up. Iris could see them though. I saw her talking to them sometimes.",
            options: [
                {
                    text: "Do you think these shadow figures had something to do with her disappearance?",
                    next: "camille_shadows_connection"
                },
                {
                    text: "Did anyone else ever see her talking to them?",
                    next: "camille_others_saw"
                },
                {
                    text: "I'd like to ask about something else.",
                    next: "default"
                }
            ],
            trust: 20,
            clue: "Camille draws shadow figures, says 'Iris used to talk to them'"
        },
        camille_opinion: {
            text: "It's okay. Kind of boring, and the other kids at school think Quiet Hollow is weird because of all the 'missing person' stuff. But I like my house, and I can walk to the park by myself.",
            options: [
                {
                    text: "What 'missing person' stuff are they talking about?",
                    next: "camille_missing"
                },
                {
                    text: "The park near the old well?",
                    next: "camille_park"
                },
                {
                    text: "I'd like to ask about something else.",
                    next: "default"
                }
            ],
            trust: 5
        },
        camille_goodbye: {
            text: "Bye! [She returns to her drawing, intensely focused once again]",
            options: [
                {
                    text: "End conversation",
                    next: "exit"
                }
            ]
        },
        // More Camille dialogue nodes...
    }
};

// Helper function to check requirements for dialogue options
function checkRequirement(req, game) {
    if (!req) return true;
    
    // Check clue requirement
    if (req.clue && !game.foundClues.has(req.clue)) {
        return false;
    }
    
    // Check trust requirement
    if (req.trust && game.trust < req.trust) {
        return false;
    }
    
    // Check time of day requirement
    if (req.timeOfDay && game.currentTimeOfDay !== req.timeOfDay) {
        return false;
    }

    // Check photo requirement
    if (req.photoRequired) {
        // Check if player has taken a specific type of photo
        const hasPhoto = game.photoDetails.some(photo => {
            // Each photo might have different conditions that make it match the required type
            switch(req.photoRequired) {
                case "flickerPhoto":
                    return photo.timeOfDay === "night" && 
                           photo.nearbyElements.some(e => e.type === 'house' && e.index === 0);
                case "shadowPhoto":
                    return photo.timeOfDay === "night" && 
                           photo.nearbyElements.some(e => e.type === 'house' && e.index === 3);
                case "wellPhoto":
                    // Check for photo of the well area at specific time
                    return photo.timeOfDay === "evening" &&
                           Math.abs(photo.position.x - 400) < 100 && 
                           Math.abs(photo.position.y - 300) < 100;
                default:
                    return false;
            }
        });
        
        if (!hasPhoto) return false;
    }
    
    return true;
} 