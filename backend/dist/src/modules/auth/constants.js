"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConstants = void 0;
if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in .env file');
    process.exit(1);
}
exports.jwtConstants = {
    secret: process.env.JWT_SECRET,
};
//# sourceMappingURL=constants.js.map