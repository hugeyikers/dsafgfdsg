# Backend - API Aplikacji Kanban

## 1. Wprowadzenie
Część serwerowa aplikacji Kanban, utworzona w frameworku NestJS. Udostępnia interfejs API, obsługuje logikę biznesową, autoryzację użytkowników oraz połączenie z relacyjną bazą danych za pośrednictwem Prisma ORM.

## 2. Technologie i ich zastosowanie
- NestJS - Budowa ustrukturyzowanej, łatwej w utrzymaniu i skalowalnej architektury serwera oraz wystawianie endpointów API.
- TypeScript - Statyczne typowanie kodu backendowego, ułatwiające zarządzanie złożoną logiką biznesową.
- Prisma ORM - Mapowanie obiektowo-relacyjne do deklaratywnego definiowania schematu bazy danych i wykonywania na niej zapytań w sposób bezpieczny typologicznie.
- JWT - Obsługa autoryzacji i uwierzytelniania, zabezpieczanie dostępu do prywatnych zasobów API dla zalogowanych użytkowników.

## 3. Struktura Katalogów
- src/modules/ - Niezależne moduły domenowe aplikacji (auth, kanban, users). Każdy z nich zawiera własne kontrolery, serwisy i definicje obiektów transferu danych (DTO).
- src/prisma/ - Serwis integrujący bazę danych z cyklem życia aplikacji NestJS.
- src/common/ - Elementy współdzielone, takie jak serwisy narzędziowe oraz interceptory.
- prisma/ - Pliki konfiguracyjne narzędzia Prisma. Obejmuje schemat bazy danych (schema.prisma), katalog migracji oraz skrypt generujący dane początkowe (seed.ts).

## 4. Dostępne Skrypty

Instalacja zależności:
```bash
npm install
```

Uruchomienie serwera w trybie deweloperskim:
```bash
npm run start:dev
```

Synchronizacja schematu bazy danych:
```bash
npx prisma db push
```

Uruchomienie skryptu zasilającego bazę danych:
```bash
npx prisma db seed
```