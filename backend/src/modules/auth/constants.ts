// backend/src/modules/auth/constants.ts
// Jeśli zmienna środowiskowa nie istnieje, rzucamy błąd.
// NIGDY nie zostawiaj domyślnego sekretu w kodzie produkcyjnym.

if (!process.env.JWT_SECRET) {
  // W środowisku developerskim można pozwolić na ostrzeżenie, ale w produkcji to błąd krytyczny.
  // Tutaj dla bezpieczeństwa rzucamy błąd zawsze, aby wymusić utworzenie pliku .env
  console.error('FATAL ERROR: JWT_SECRET is not defined in .env file');
  process.exit(1);
}

export const jwtConstants = {
  secret: process.env.JWT_SECRET,
};