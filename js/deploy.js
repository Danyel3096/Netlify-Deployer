const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../environments/.env') });
const axios = require('axios');
const { execSync } = require('child_process');
const fs = require('fs');

const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN;

async function createSite(name) {
  const response = await axios.post(
    'https://api.netlify.com/api/v1/sites',
    { name },
    {
      headers: {
        Authorization: `Bearer ${NETLIFY_TOKEN}`
      }
    }
  );
  return response.data;
}

async function deployWithCLI(site, distPath) {
  const siteId = site.id;

  try {
    if (!fs.existsSync(distPath)) {
      console.error(`❌ La carpeta "${distPath}" no existe. ¿Ejecutaste "ng build"?`);
      process.exit(1);
    } else {
      console.log(`✅ Ruta válida: ${distPath}`);
    }

    console.log(`📦 Desplegando carpeta: ${distPath}`);
    console.log(`🚀 Ejecutando Netlify CLI con ruta: ${distPath.replace(/\\/g, '\\\\')}`);

    execSync(
      `netlify deploy --site=${siteId} --auth=${NETLIFY_TOKEN} --prod --dir="${distPath.replace(/\\/g, '\\\\')}"`,
      { stdio: 'inherit' }
    );

    console.log('🔎 Site ID:', site.id);
    console.log('🔎 Site Name:', site.name);
    console.log('✅ Deploy completo');
  } catch (err) {
    console.error('❌ Error al ejecutar Netlify CLI:', err.message);
  }
}

(async () => {
  const siteName = `cliente-${Date.now()}`;
  const distPath = path.resolve(__dirname, './../../FrontEnd-Calidad/dist/frontend/browser');

  try {
    const site = await createSite(siteName);
    console.log('✅ Sitio creado:', site.name);

    await deployWithCLI(site, distPath);

    console.log('🚀 Deploy realizado en:', `https://${site.name}.netlify.app`);
  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
  }
})();
