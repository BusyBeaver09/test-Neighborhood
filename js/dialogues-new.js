/**
 * dialogues-new.js
 * 
 * New dialogue data format for Maplewood Lane: Neighborhood Mysteries
 * Structured for use with the DialogueManager system
 */

const DIALOGUE_DATA = {
    "characters": {
        "mrs_finch": {
            "id": "mrs_finch",
            "name": "Mrs. Finch",
            "portrait": "portrait-mrs-finch",
            "dialogs": [
                {
                    "id": "default",
                    "lines": [
                        "Oh, hello dear! It's nice to see a new face around Quiet Hollow. Are you visiting?"
                    ],
                    "choices": [
                        {
                            "text": "I'm Elia Martinez. I used to live here - I've come back to reconnect with the town.",
                            "next": "mrs_finch_intro"
                        },
                        {
                            "text": "I'm looking into what happened to Iris Bell. Did you know her?",
                            "next": "mrs_finch_iris"
                        },
                        {
                            "text": "Just exploring the neighborhood. It seems quiet here.",
                            "next": "mrs_finch_quiet"
                        },
                        {
                            "text": "Just saying hello. Have a nice day!",
                            "next": "mrs_finch_goodbye"
                        }
                    ]
                },
                {
                    "id": "mrs_finch_morning_low_trust",
                    "lines": [
                        "Oh Elia, dear... still snooping around, are you? [She looks you over carefully.] You should be careful what you dig up in this town."
                    ],
                    "conditions": {
                        "trustMin": 0,
                        "trustMax": 10,
                        "timeOfDay": "morning"
                    },
                    "mood": "suspicious",
                    "choices": [
                        {
                            "text": "I just want to understand what happened to Iris.",
                            "next": "mrs_finch_iris",
                            "effects": { "trust": 2 }
                        },
                        {
                            "text": "Are you warning me about something specific?",
                            "next": "mrs_finch_warning",
                            "effects": { "trust": -1 }
                        },
                        {
                            "text": "I'll be careful. Have a nice day.",
                            "next": "mrs_finch_goodbye"
                        }
                    ]
                },
                {
                    "id": "mrs_finch_afternoon_medium_trust",
                    "lines": [
                        "You remind me of Iris. Always asking questions. […Too many, if you ask me.]"
                    ],
                    "conditions": {
                        "trustMin": 10,
                        "trustMax": 24,
                        "timeOfDay": "afternoon"
                    },
                    "mood": "suspicious",
                    "choices": [
                        {
                            "text": "I just want to understand.",
                            "next": "mrs_finch_understanding",
                            "effects": { "trust": 5 }
                        },
                        {
                            "text": "Then tell me what you know.",
                            "next": "mrs_finch_demanding",
                            "effects": { 
                                "trust": -2,
                                "unlockClue": "Mrs. Finch becomes defensive when pressed about Iris" 
                            }
                        },
                        {
                            "text": "What kind of questions was Iris asking?",
                            "next": "mrs_finch_iris_questions"
                        }
                    ]
                },
                {
                    "id": "mrs_finch_night_high_trust",
                    "lines": [
                        "That night, the basement light kept flickering. I thought it was just the storm. But I swear, I saw someone... *someone that wasn't Iris.*"
                    ],
                    "conditions": {
                        "trustMin": 25,
                        "timeOfDay": "night"
                    },
                    "mood": "mysterious",
                    "choices": [
                        {
                            "text": "Could it have been a reflection?",
                            "next": "mrs_finch_reflection"
                        },
                        {
                            "text": "Was it a shadow figure?",
                            "next": "mrs_finch_shadow",
                            "effects": {
                                "unlockClue": "Mrs. Finch may have seen a 'shadow figure' in Iris's basement"
                            }
                        },
                        {
                            "text": "Show photo: Flickering Light",
                            "next": "mrs_finch_photo_flicker",
                            "requiresPhoto": "flickerPhoto",
                            "effects": { "trust": 10 }
                        }
                    ]
                },
                {
                    "id": "mrs_finch_intro",
                    "lines": [
                        "Martinez? Oh my, little Elia! I remember you, though you've grown so much. You were friends with poor Iris, weren't you? Such a shame what happened..."
                    ],
                    "effects": { 
                        "trust": 5,
                        "unlockClue": "Mrs. Finch mentions 'poor Iris' but doesn't elaborate"
                    },
                    "choices": [
                        {
                            "text": "What exactly happened to Iris?",
                            "next": "mrs_finch_iris"
                        },
                        {
                            "text": "How have things been in the neighborhood lately?",
                            "next": "mrs_finch_neighborhood"
                        },
                        {
                            "text": "I'd like to ask about something else.",
                            "next": "default"
                        }
                    ]
                },
                // Additional dialogue nodes...
            ]
        },
        "jake_lila": {
            "id": "jake_lila",
            "name": "Jake & Lila",
            "portrait": "portrait-jake-lila",
            "dialogs": [
                {
                    "id": "default",
                    "lines": [
                        "Hey there! You must be new around here. I'm Jake, this is my wife Lila. We moved into this house about five months ago."
                    ],
                    "choices": [
                        {
                            "text": "I'm Elia Martinez. I actually grew up here but moved away years ago.",
                            "next": "jake_lila_returning"
                        },
                        {
                            "text": "This used to be Iris Bell's house, right? What happened to her?",
                            "next": "jake_lila_iris"
                        },
                        {
                            "text": "How do you like living in Quiet Hollow?",
                            "next": "jake_lila_opinion"
                        },
                        {
                            "text": "Just saying hello. Take care!",
                            "next": "jake_lila_goodbye"
                        }
                    ]
                },
                {
                    "id": "jake_lila_returning",
                    "lines": [
                        "[Lila] Martinez? Wait, you're related to Iris, aren't you? [Jake gives her a concerned look] I mean, we heard about Iris from the neighbors. We never met her ourselves."
                    ],
                    "effects": { "trust": 5 },
                    "choices": [
                        {
                            "text": "She was my cousin. Do you know what happened to her?",
                            "next": "jake_lila_iris"
                        },
                        {
                            "text": "You seem nervous about Iris. Why is that?",
                            "next": "jake_lila_nervous",
                            "trustMin": 20
                        },
                        {
                            "text": "Tell me about how you ended up in this house.",
                            "next": "jake_lila_house"
                        }
                    ]
                },
                {
                    "id": "jake_lila_iris",
                    "lines": [
                        "[Jake] From what we heard, she just left town. Young people do that sometimes, right? Just take off without telling anyone. [Lila] We got the house at a foreclosure auction. Really good deal. [She looks uncomfortable]"
                    ],
                    "effects": { 
                        "trust": 10,
                        "unlockClue": "Jake and Lila claim Iris 'left town'"
                    },
                    "choices": [
                        {
                            "text": "That seems strange. No one knows where she went?",
                            "next": "jake_lila_whereabouts"
                        },
                        {
                            "text": "Do you ever notice anything strange in the house?",
                            "next": "jake_lila_strange_house"
                        },
                        {
                            "text": "I'd like to ask about something else.",
                            "next": "default"
                        }
                    ]
                },
                // Additional dialogue nodes...
            ]
        },
        "mr_arnold": {
            "id": "mr_arnold",
            "name": "Mr. Arnold",
            "portrait": "portrait-mr-arnold",
            "dialogs": [
                {
                    "id": "default",
                    "lines": [
                        "What do you want? I'm busy. [He eyes you suspiciously] You're not another reporter, are you?"
                    ],
                    "choices": [
                        {
                            "text": "I'm Elia Martinez. I used to live in this neighborhood.",
                            "next": "mr_arnold_returning"
                        },
                        {
                            "text": "I'm looking into what happened to Iris Bell.",
                            "next": "mr_arnold_iris"
                        },
                        {
                            "text": "Just being friendly with the neighbors.",
                            "next": "mr_arnold_friendly"
                        },
                        {
                            "text": "Sorry to bother you. I'll go.",
                            "next": "mr_arnold_goodbye"
                        }
                    ]
                },
                {
                    "id": "mr_arnold_night_low_trust",
                    "lines": [
                        "[You find Mr. Arnold standing in his yard, staring at the abandoned house] What are you doing out this late? Nothing good happens after dark in this town. [He continues staring without looking at you]"
                    ],
                    "conditions": {
                        "trustMin": 0,
                        "trustMax": 20,
                        "timeOfDay": "night"
                    },
                    "mood": "mysterious",
                    "choices": [
                        {
                            "text": "What are you looking at?",
                            "next": "mr_arnold_watching"
                        },
                        {
                            "text": "Have you seen anything unusual tonight?",
                            "next": "mr_arnold_unusual_sighting"
                        },
                        {
                            "text": "I'll leave you alone.",
                            "next": "mr_arnold_goodbye"
                        }
                    ]
                },
                {
                    "id": "mr_arnold_evening_medium_trust",
                    "lines": [
                        "[Mr. Arnold is cleaning an old flashlight] The abandoned house... Sometimes I see the basement lights turn on. Nobody's lived there since Iris... [he pauses] I keep watch, you know."
                    ],
                    "conditions": {
                        "trustMin": 20,
                        "trustMax": 40,
                        "timeOfDay": "evening"
                    },
                    "mood": "suspicious",
                    "choices": [
                        {
                            "text": "Why do you watch that house?",
                            "next": "mr_arnold_watching_reason",
                            "effects": { "trust": 5 }
                        },
                        {
                            "text": "You mentioned seeing Iris the night she disappeared. Did you approach her?",
                            "next": "mr_arnold_last_sighting_detail",
                            "effects": { "trust": 3 }
                        },
                        {
                            "text": "Show photo: Basement Light",
                            "next": "mr_arnold_basement_photo",
                            "requiresPhoto": "flickerPhoto",
                            "effects": { "trust": 10 }
                        }
                    ]
                },
                // Additional dialogue nodes...
            ]
        },
        "camille": {
            "id": "camille",
            "name": "Camille",
            "portrait": "portrait-camille",
            "dialogs": [
                {
                    "id": "default",
                    "lines": [
                        "[A young girl, about 12, is sitting on a porch swing, drawing intensely in a sketchbook. She looks up as you approach] Oh, hi. Are you new here?"
                    ],
                    "choices": [
                        {
                            "text": "I'm Elia. I used to live here when I was younger.",
                            "next": "camille_introduction"
                        },
                        {
                            "text": "I'm looking for information about Iris Bell. Did you know her?",
                            "next": "camille_iris"
                        },
                        {
                            "text": "What are you drawing there?",
                            "next": "camille_drawing"
                        },
                        {
                            "text": "Just saying hi. Have a nice day!",
                            "next": "camille_goodbye"
                        }
                    ]
                },
                {
                    "id": "camille_drawing",
                    "lines": [
                        "[She hesitates, then turns her sketchbook to show you. The page is filled with shadowy, elongated figures lurking between trees and houses] Just some people I see sometimes. Not real people. Well, Iris said they might be real, just not in the way most people think."
                    ],
                    "effects": { "trust": 15 },
                    "choices": [
                        {
                            "text": "These are really interesting. Why do you draw these figures?",
                            "next": "camille_figures_why"
                        },
                        {
                            "text": "What did Iris tell you about them?",
                            "next": "camille_iris_shadows"
                        },
                        {
                            "text": "I'd like to ask about something else.",
                            "next": "default"
                        }
                    ]
                },
                {
                    "id": "camille_iris_shadows",
                    "lines": [
                        "She said they were... watchers, I think? She said they've always been here, but most people forget how to see them when they grow up. Iris could see them though. I saw her talking to them sometimes."
                    ],
                    "effects": { 
                        "trust": 20,
                        "unlockClue": "Camille draws shadow figures, says 'Iris used to talk to them'"
                    },
                    "mood": "mysterious",
                    "choices": [
                        {
                            "text": "Do you think these shadow figures had something to do with her disappearance?",
                            "next": "camille_shadows_connection"
                        },
                        {
                            "text": "Did anyone else ever see her talking to them?",
                            "next": "camille_others_saw"
                        },
                        {
                            "text": "I'd like to ask about something else.",
                            "next": "default"
                        }
                    ]
                },
                // Additional dialogue nodes...
            ]
        }
    }
}; 