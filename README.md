# YEET Wettbilanz Dashboard

Diese Variante ist fuer eine GitHub-Pages-Vorschau gedacht.

Sie enthaelt aggregierte Auswertungen sowie die tagesgenaue Ergebnisfolge je Einsatzplan-Band mit sichtbaren Ligen, Spielen, Quoten und Betraegen, aber keine:

- vollstaendigen oder gekuerzten Bet-IDs
- exakten Wettzeitpunkte
- Rohdatenliste einzelner Wettscheine

Die Form zeigt bis zu zehn zuletzt platzierte Wetten, neueste rechts. Abgeleitete Baender erhalten keine geliehene Form. Kontra-Ergebnisse werden nur bei dokumentiertem Ausloeser mit dem urspruenglichen Signalband verknuepft. Aktuelle Originalbilanz und dokumentierte Signal-Snapshots sind getrennt; fehlende Historie wird nicht rekonstruiert. Die privaten Quell-IDs und genauen Platzierungszeiten dienen nur der lokalen Sortierung.

## Lokal starten

```powershell
python -m http.server 8790 --bind 127.0.0.1
```

Dann oeffnen:

```text
http://127.0.0.1:8790
```
