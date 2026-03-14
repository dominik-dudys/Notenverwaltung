# Studentenverwaltung

## Tech Stack
- Frontend: React + TypeScript
- CSS: Tailwind
- Backend: Supabase (Auth + Datenbank)
- Datenbank: PostgreSQL via Supabase
- Excel-Integration: Microsoft Graph API (OneDrive/SharePoint)

## Projektbeschreibung
Webapplikation zur Studentenverwaltung. Login via Supabase Auth.
Zwei Hauptfunktionen: Stundenplan (aus Excel via OneDrive) und Notenverwaltung.

## MVP Features
- [ ] Auth (Login/Logout via Supabase)
- [ ] Stundenplan-Ansicht (Excel aus FH OneDrive via Microsoft Graph API)
- [ ] Notenverwaltung (Noten speichern, anzeigen, Durchschnitt)
- [ ] Module mit ECTS Punkten

## Datenbankschema
### students
- id, email, created_at

### modules
- id, student_id, name, ects, semester

### grades
- id, module_id, grade, date, description

## Umgebungsvariablen
Siehe .env.example

## Wichtige Hinweise
- Niemals direkt in Produktions-Datenbank schreiben
- Immer Migrations für Schemaänderungen
- Microsoft Graph API braucht Azure App Registration
- Prüfe bitte jedes mal, ob es Imports oder Funktionen gibt, die nicht benutzt werden