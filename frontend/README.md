# Frontend - Aplikacja Kanban

## 1. Wprowadzenie
Część dla klienta aplikacji Kanban, zbudowana w oparciu o bibliotekę React oraz narzędzie Vite. Odpowiada za interfejs użytkownika, zarządzanie stanem lokalnym i komunikację z serwerem API.

## 2. Technologie i ich zastosowanie
- React (Vite) - Tworzenie interfejsu użytkownika w oparciu o komponenty oraz zapewnienie wydajnego środowiska deweloperskiego.
- TypeScript - Typowanie statyczne, zwiększające bezpieczeństwo kodu i ułatwiające wychwytywanie błędów na etapie pisania.
- Tailwind CSS - Szybkie stylowanie elementów interfejsu przy użyciu gotowych klas narzędziowych (utility-first).
- Zustand - Zarządzanie globalnym stanem aplikacji w przeglądarce klienta (np. przechowywanie danych o zalogowanym użytkowniku czy układzie tablicy).

## 3. Struktura Katalogu src/
- api/ - Klient HTTP oraz konfiguracja zapytań do backendu.
- assets/ - Pliki statyczne oraz globalne arkusze stylów.
- features/ - Komponenty i logika podzielona na konkretne funkcjonalności. Obejmuje m.in. moduł kanban z elementami KanbanBoard, Column i Task.
- layouts/ - Główne komponenty układu interfejsu, np. DashboardLayout.
- pages/ - Widoki pełnoekranowe, takie jak ekran logowania (Login.tsx).
- store/ - Pliki zarządzające globalnym stanem aplikacji przy pomocy biblioteki Zustand (useAuthStore.ts, useKanbanStore.ts).

## 4. Dostępne Skrypty

Instalacja zależności:
```bash
npm install
```

Uruchomienie serwera deweloperskiego:
```bash
npm run dev
```

Budowanie wersji produkcyjnej:
```bash
npm run build
```