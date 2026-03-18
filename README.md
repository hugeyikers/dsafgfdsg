# Dokumentacja Projektu: Aplikacja Kanban

## 1. Wprowadzenie
Aplikacja Kanban to wielowarstwowa aplikacja webowa typu full-stack, służąca do zarządzania zadaniami. Projekt został stworzony z myślą o efektywnej organizacji pracy, wykorzystując nowoczesne technologie frontendowe oraz backendowe. 

Projekt jest realizowany na Uniwersytecie Warmińsko-Mazurskim w Olsztynie w ramach przedmiotu "Projekt Zespołowy" we współpracy z firmą Billenium.

## 2. Zespół Projektowy
W skład zespołu wchodzą:
- Piotr Ostaszewski
- Jakub Malinowski
- Adrian Skamarski
- Radosław Matusiak
- Jakub Klimas

## 3. Stack Technologiczny

### 3.1. Frontend
- React (Vite)
- TypeScript
- Tailwind CSS
- Zustand

### 3.2. Backend
- NestJS
- TypeScript
- Prisma ORM
- Relacyjna baza danych
- JWT

## 4. Architektura i Struktura Katalogów
Aplikacja została podzielona na dwa oddzielne środowiska:
- `backend/` - Zawiera serwerową część aplikacji (API) napisaną w frameworku NestJS. Odpowiada za logikę biznesową, bezpieczeństwo (JWT) oraz komunikację z bazą danych (Prisma).
- `frontend/` - Zawiera kliencką część aplikacji stworzoną w bibliotece React z użyciem Vite, odpowiadającą za interfejs użytkownika.

## 5. Wymagania Wstępne
Do poprawnego uruchomienia projektu w środowisku deweloperskim niezbędne są:
- Node.js (w najnowszej stabilnej wersji lub LTS)
- npm

## 6. Instalacja
Aby zainstalować wszystkie wymagane zależności dla całego środowiska, należy w głównym katalogu projektu uruchomić polecenie:

```bash
npm run install:all
```

## 7. Uruchamianie Aplikacji
Projekt oferuje dwa zautomatyzowane sposoby na jednoczesne uruchomienie frontendu i backendu. W trybie deweloperskim backend obsługuje HMR, a frontend automatycznie odświeża widok po zmianach w plikach.

### Metoda 1: Skrypt npm
Z poziomu głównego katalogu projektu:

```bash
npm start
```

### Metoda 2: Skrypt Windows (Batch)
Należy uruchomić plik wykonywalny znajdujący się w głównym katalogu:

```cmd
start_project.bat
```

## 8. Dostęp do Usług
Po uruchomieniu środowiska usługi dostępne są pod następującymi adresami:
- Kliencka aplikacja webowa (Frontend): http://localhost:5173
- Interfejs API (Backend): http://localhost:3000

## 9. Zarządzanie Bazą Danych (Prisma)
Wszelkie operacje na bazie danych realizowane są poprzez narzędzie Prisma, operujące wewnątrz katalogu `backend/`.

Aktualizacja struktury bazy danych na podstawie pliku `schema.prisma`:

```bash
cd backend
npx prisma db push
```

Wypełnienie bazy danych danymi początkowymi:

```bash
cd backend
npx prisma db seed
```