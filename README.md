# Football Transfer Market Simulation

Een realistische voetbal transfermarkt simulatie met live auctions, AI biedingen, en club management.

## 🚀 Features

- **Live Auctions**: Real-time veilingen met countdown timers
- **AI Bidding**: Automatische AI clubs die bieden op spelers
- **Club Management**: Beheer je club, budget en spelers
- **Transfer History**: Volledige geschiedenis van alle transfers
- **Daily Simulation**: Simuleer transfermarkt activiteit

## 🛠️ Recente Fixes

### Opgeloste Problemen:
1. **Race Conditions**: Gebruik van MongoDB transactions voor atomische operaties
2. **Speler Toewijzing**: Verbeterde speler toevoeging met `$addToSet` om duplicaten te voorkomen
3. **Budget Synchronisatie**: Betere budget updates met atomic operations
4. **Live Auction Bugs**: Verbeterde error handling en timing
5. **Speler Verlies**: Spelers worden nu correct toegevoegd na aankoop

### Debug Scripts:
- `checkPlayerAssignments.js`: Controleer speler toewijzingen
- `fixPlayerAssignments.js`: Repareer inconsistente speler toewijzingen

## 📋 Installatie

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## 🚀 Starten

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm start
```

## 🔧 Debugging

### Speler Toewijzingen Controleren
```bash
cd backend
node scripts/checkPlayerAssignments.js
```

### Speler Toewijzingen Repareren
```bash
cd backend
node scripts/fixPlayerAssignments.js
```

### Auto-Bidder Herstarten
```bash
cd backend
node scripts/restartAutoBidder.js
```

### Club Spelers Bekijken
```bash
curl http://localhost:3000/api/clubs/{clubId}/players
```

### Stuck Auctions Opschonen
```bash
cd backend
node scripts/restartAutoBidder.js
```

## 🎮 Gebruik

1. **Registreer** een account en kies een club
2. **Bekijk** de transfermarkt voor live auctions
3. **Bied** op spelers of gebruik "Buy Now"
4. **Beheer** je club en bekijk je spelers
5. **Run** daily simulations voor nieuwe auctions

## 🔄 API Endpoints

### Auctions
- `GET /api/auctions` - Alle actieve auctions
- `POST /api/auctions/:id/bid` - Plaats een bod
- `POST /api/auctions/:id/buy-now` - Koop direct
- `POST /api/auctions/:id/process` - Verwerk beëindigde auction

### Clubs
- `GET /api/clubs` - Alle clubs
- `GET /api/clubs/:id` - Specifieke club
- `GET /api/clubs/:id/players` - Club spelers
- `PUT /api/clubs/:id` - Update club

### Simulation
- `POST /api/simulation/transfer` - Simuleer enkele transfer
- `POST /api/simulation/day` - Dagelijkse simulatie

## 🐛 Bekende Problemen & Oplossingen

### Probleem: Speler wordt niet toegevoegd na aankoop
**Oplossing**: Gebruik de debug scripts om speler toewijzingen te controleren en repareren.

### Probleem: Live auctions stoppen abrupt
**Oplossing**: Verbeterde error handling en atomic operations geïmplementeerd.

### Probleem: Budget wordt niet correct bijgewerkt
**Oplossing**: MongoDB transactions gebruikt voor consistente budget updates.

## 🔍 Troubleshooting

1. **Spelers verdwijnen**: Run `fixPlayerAssignments.js`
2. **Auctions stoppen**: Check server logs voor errors
3. **Budget problemen**: Refresh de pagina en check club data
4. **AI biedt niet**: Check of autoBidder script draait

## 📊 Technische Details

- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React + Axios
- **Database**: MongoDB met Mongoose ODM
- **Real-time**: Polling elke 10 seconden voor live updates
- **Transactions**: MongoDB sessions voor data consistency
