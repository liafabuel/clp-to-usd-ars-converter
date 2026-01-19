# 🇨🇱 Chile Trip Calc - Resilient Currency Converter

Una aplicación web progresiva (PWA) diseñada para viajeros argentinos en Chile, enfocada en la velocidad de uso y la resiliencia en condiciones de baja conectividad.

## 🚀 Propósito del Proyecto
Este proyecto nació de la necesidad práctica de gestionar gastos durante un viaje a Chile, donde la brecha cambiaria de Argentina (Dólar Blue/Tarjeta) y la posible falta de roaming exigen una herramienta que sea más que un simple conversor.

## 🛠️ Stack Tecnológico
- **Framework:** [React](https://reactjs.org/) con [Vite](https://vitejs.dev/)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) (Tipado fuerte para lógica financiera)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/) con diseño *Glassmorphism*
- **API:** [ExchangeRate-API](https://www.exchangerate-api.com/)
- **Despliegue:** [Vercel](https://vercel.com/)

## ✨ Características Principales
- **Conversión Triple:** CLP a USD y ARS en una sola pantalla.
- **Offline-First:** Las tasas de cambio se persisten en `localStorage`. Si no tienes datos en la calle, la app usa la última cotización guardada.
- **Ajuste de Brecha (ARS):** Incluye un multiplicador configurable para adaptar la cotización oficial al valor real (Dólar Blue o Tarjeta).
- **UX Optimizada:** Teclado numérico automático, botones de montos rápidos y función de limpieza instantánea.

## ⚙️ Instalación y Configuración

1. Clonar el repositorio:
   ```bash
   git clone [https://github.com/tu-usuario/chile-trip-calc.git](https://github.com/tu-usuario/chile-trip-calc.git)
2. Instalar dependencias:
   ```bash
   npm install
3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   
## 📱 Visualización en el móvil

Para utilizar esta herramienta en tu teléfono como una aplicación nativa, sigue estos pasos:

1. **Sube el código a GitHub:** Asegúrate de que todos tus cambios estén en tu repositorio.
2. **Vincula el repo en Vercel:** Realiza el despliegue para obtener una URL pública.
3. **Abre la URL en tu móvil:** Utiliza **Safari** en iOS o **Chrome** en Android.
4. **Instala la App:** Selecciona la opción **"Agregar a la pantalla de inicio"** en el menú de compartir o configuración de tu navegador.

---
Desarrollado con ❤️ por una **Ingeniera en Sistemas** para facilitar los viajes por la cordillera.
