// Diagnostic script to check environment variables
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

console.log('\n=== Environment Variable Check ===\n');



console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET ✓' : 'NOT SET ✗');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET ✓' : 'NOT SET ✗');

console.log('\n=== All Env Vars ===');
console.log(Object.keys(process.env).filter(k => k.includes('TOKEN') || k.includes('DB') || k.includes('SECRET')));

console.log('\n');

