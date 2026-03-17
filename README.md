<!-- ABOUT THE PROJECT -->
# Aplikacja typu Kanban

Wielowarstwowa aplikacja webowa (full-stack) zbudowana w oparciu o backend w NestJS oraz frontend w React (Vite).

## 📖 O projekcie

Projekt realizowany w ramach przedmiotu **"Projekt Zespołowy"** na **Uniwersytecie Warmińsko-Mazurskim w Olsztynie** we współpracy z firmą **Billenium**.

**Członkowie zespołu:**
- [Piotr Ostaszewski](https://github.com/PET3R12)
- [Jakub Malinowski](https://github.com/Nexeros)
- [Adrian Skamarski](https://github.com/hugeyikers)
- [Radosław Matusiak](https://github.com/gilo0)
- [Jakub Klimas](https://github.com/JunglersYikes)

## 💻 Stack Technologiczny

**Frontend:**

- React (Vite)
- TypeScript
- Tailwind CSS
- Zustand (Zarządzanie stanem)
**Backend:**
- NestJS
- TypeScript
- Prisma ORM
- Baza danych (obsługiwana przez Prisma)
- JWT (Autoryzacja i autentykacja)

## Struktura Projektu

- `backend/` - Serwerowa aplikacja API (NestJS + Prisma).
- `frontend/` - Kliencka aplikacja webowa (React + Vite).

## Prerequirements

- Node.js (Zalecana najnowsza stabilna wersja / LTS)
- npm

##  Instalacja

1. Aby zainstalować wszystkie wymagane pakiety należy w roocie 

```
npm run install:all
```

_(Alternatywnie, możesz uruchomić komendę `npm install` w każdym z trzech folderów osobno: w głównym katalogu, w `backend/` oraz `frontend/`)_

## 🏃‍♂️ Uruchamianie aplikacji

Istnieją dwa proste sposoby na jednoczesne uruchomienie całego projektu (Frontendu i Backendu):

### Opcja 1: Przy użyciu skryptu npm (Zalecane)

Uruchom poniższą komendę w głównym katalogu projektu:

```
npm start
```

_Dzięki paczce `concurrently` komenda ta uruchomi oba serwery (backend i frontend) równolegle w jednym oknie terminala._

### Opcja 2: Przy użyciu skryptu Windows (Batch)

Kliknij dwukrotnie plik `start_project.bat` znajdujący się w głównym katalogu projektu.

## 🌍 Dostęp do aplikacji

Po pomyślnym starcie obu serwerów:

- **Frontend (Aplikacja):** Otwórz [http://localhost:5173](http://localhost:5173 "null") w swojej przeglądarce.
    
- **Backend (API):** Interfejs programistyczny działa pod adresem [http://localhost:3000](http://localhost:3000 "null").
    

### 🛠 Tryb deweloperski

- **Backend:** Wszelkie zmiany w kodzie wewnątrz folderu `backend/` automatycznie wywołają przeładowanie serwera (HMR).
    
- **Frontend:** Zmiany w plikach w folderze `frontend/` natychmiastowo i automatycznie odświeżą widok w przeglądarce.
    

## 🗄️ Baza Danych (Prisma)

Backend wykorzystuje narzędzie Prisma do komunikacji z bazą danych. Jeśli potrzebujesz wprowadzić zmiany w schemacie bazy danych, postępuj zgodnie z poniższymi krokami:

1. Edytuj schemat w pliku `backend/prisma/schema.prisma`.
    
2. Zastosuj migracje / wypchnij zmiany do struktury bazy danych:
    
    ```
    cd backend
    npx prisma db push
    ```
    
3. Wygeneruj dane początkowe/testowe w bazie (opcjonalnie):
    
    ```
    cd backend
    npx prisma db seed
    ```
### Stack Technologiczny:
