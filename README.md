# LOCK-IN
An application that moniters you while you work and if you get distracted it tells you to lock in(Windows tested)

Features:

-Onboarding

  Welcome screen

-Blacklist

  Blocks websites (detected through the browser window title)
  Blocks native applications (e.g. Discord, games, detected through the process name)
  Add/remove items from the list at any time
  Persistent storage : the list is saved and stays even after closing and reopening the app

Detection and blocking

    Automatically monitors the active window/application every few seconds
    Fullscreen "LOCK IN" overlay appears when a blocked site or app is detected
    High-contrast outlined text, readable on any background (light or dark)
    Click-through overlay — doesn't block interaction with other windows, it only serves as a visual reminder

Timer

    "With timer" or "without timer" mode, chosen by the user
    Customizable timer (hours:minutes:seconds) with quick presets (+30 min, +1h, +2h)
    Countdown visible in a small always-on-top widget in the top-right corner of the screen
    "Session completed" screen once the set time runs out
    Timer settings (mode and duration) are saved and remembered between sessions

-Distribution

  Packaged into a Windows installer (.exe) using electron-builder, so it can be downloaded and run without needing Node.js or technical knowledge

AI usage declaration:

I’ve used Ai, it has helped to understand which language to use and helped me understand CSS , JAVASCRIPTS/NODE and HTML concepts.
I want to be clear: the code was written word for word by me personally, and the design choices were totally mine.


This is a desktop app, not a web app , you can download and try it from the Release link here:
https://github.com/emanuelaportella09-hub/LOCK-IN/releases/tag/v1.0.3


