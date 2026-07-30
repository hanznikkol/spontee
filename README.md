# 🎲 Spontee

> **Stop arguing. Start deciding.**

Spontee is a real-time collaborative decision-making web application that helps couples, friends, and groups quickly decide where to eat, where to go, or what to do together.

Instead of endlessly asking **"Saan tayo kakain?"** or **"Ano gusto niyo gawin?"**, Spontee lets everyone vote independently through a Tinder-like swipe interface until the group reaches a common match.

---

## ✨ Features

- 🏠 Create private decision rooms
- 🔗 Share rooms using links or QR Codes
- 👥 Real-time participants
- ❤️ Tinder-style swipe voting
- 📍 Google Places integration
- 🎯 Personalized room preferences
- 💰 Budget filtering
- 📌 Distance filtering
- 🗺️ Nearby recommendations
- ⚡ Live synchronization with Supabase Realtime
- 📱 Responsive UI

---

# Demo

*(Coming Soon)*

---

# Problem Statement

Choosing where to go as a group often leads to:

- Long discussions
- Decision fatigue
- Different preferences
- No clear majority
- Endless "Ikaw bahala."

Spontee solves this by transforming group decision-making into a fun voting experience.

---

# Goals

Spontee aims to:

- Reduce decision fatigue
- Make voting enjoyable
- Reach consensus faster
- Remove unnecessary discussions
- Encourage spontaneous meetups

---

# How It Works

## 1. Create Room

The host creates a room.

They configure:

- Room name
- Privacy
- Maximum participants
- Room preferences

---

## 2. Select Preferences

Instead of manually entering options, the host chooses:

- Categories
- Budget
- Search radius
- Location

Example:

```text
Categories
✔ Coffee
✔ Food
✔ Gaming

Budget
$$

Radius
5 km

Location
Current Location
```

---

## 3. Google Places Search

The backend automatically searches Google Places based on the selected preferences.

Instead of searching:

```text
Gaming
```

The backend expands it into multiple search intents:

```text
Gaming
    ↓
Arcade
    ↓
Internet Cafe
    ↓
VR Center
    ↓
Board Game Cafe
    ↓
Merge Results
```

This architecture separates the user-friendly category from the actual search strategy used internally.

---

## 4. Generate Options

The system:

- Removes duplicates
- Filters by budget
- Sorts by rating
- Sorts by distance
- Converts Google Places results into room options

---

## 5. Lobby

Participants join using:

- Room Link
- QR Code

The host waits until everyone joins.

---

## 6. Start Voting

Every participant starts voting independently.

Users swipe:

- ❤️ Pick
- ❌ Pass

Votes are synchronized in real time.

---

## 7. Match Found

When everyone likes the same place:

🎉 **Match!**

The application displays the winning location.

---


# Author

**Hanz Nikkol B. Maas**

- 🎓 BSIT Graduate (Magna Cum Laude)
- 💻 Frontend Developer
- 🌐 Portfolio: https://hanznikkolmaas.vercel.app

---

# License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

> **Spontee — Because great plans shouldn't start with "Ikaw bahala."**