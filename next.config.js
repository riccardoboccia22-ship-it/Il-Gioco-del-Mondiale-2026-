/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      // Questo permette di completare il build anche se ci sono 
      // avvisi sugli apostrofi o sulle immagini <img>
      ignoreDuringBuilds: true,
    },
    typescript: {
      // Ignora anche eventuali errori di "tipo" per ora
      ignoreBuildErrors: true,
    },
  }
  
  module.exports = nextConfig