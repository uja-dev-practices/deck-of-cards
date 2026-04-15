# Deck of Cards <img align="right" width="60" height="40" alt="image" src="https://github.com/user-attachments/assets/e654df77-be36-4d38-8b5a-a3d3eac462e3" />



<div align="center">

![FastAPI](https://img.shields.io/badge/FastAPI-109989?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-0db7ed?style=for-the-badge&logo=docker&logoColor=white)
![OAuth2](https://img.shields.io/badge/Google%20OAuth2-4285F4?style=for-the-badge&logo=google&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

</div>

<div align="center">
  <strong>Proyecto completo con backend en FastAPI + MongoDB, frontend en React + Vite, contenedores Docker, autenticación por email y Google OAuth 2.0, y sistema de cálculo DoC-MF / DoC-IT2MF.</strong>
</div>

Incluye:

- Backend en **FastAPI + MongoDB**
- Frontend en **Vite + React**
- Contenedores Docker para todo el proyecto
- Sistema de historial por usuario
- Login normal + Login con Google

---

# ⚡ 0. ¿En qué consiste?

**Deck of Cards – TFG** es una herramienta completa diseñada para construir, validar y evaluar **funciones de pertenencia difusas** mediante el método **Deck of Cards (DoC)**, tanto en su versión **T1MF** (tipo-1) como **IT2MF** (tipo-2 intervalar).  

> [!INFO] 
> El sistema combina un backend robusto en **FastAPI + MongoDB**, un frontend moderno en **React + Vite**, autenticación por email y **Google OAuth 2.0**, y un sistema de historial por usuario para guardar y recuperar trabajos anteriores.

---

### ◻️ Objetivos del proyecto

- Digitalizar el método Deck of Cards, permitiendo calcular funciones de valor y funciones de pertenencia de forma rápida, guiada y sin errores.
- Facilitar la creación de modelos difusos para toma de decisiones, análisis multicriterio y sistemas expertos.
- Ofrecer validación automática de núcleos, soportes y nodos para evitar inconsistencias matemáticas.
- Permitir trabajar tanto con funciones **T1MF** como **IT2MF**, incluyendo intervalos en cartas blancas.
- Proveer una API modular, clara y reutilizable para estudiantes, investigadores y desarrolladores.
- Guardar el trabajo del usuario mediante un sistema de historial asociado a su cuenta.

---

### ◻️ ¿En qué puede ayudar a la gente?

Este proyecto es especialmente útil para:

- **Estudiantes** que necesiten aprender o aplicar lógica difusa y métodos de decisión.
- **Investigadores** que requieran generar funciones de pertenencia de forma precisa y reproducible.
- **Profesionales** que trabajen en:
  - análisis multicriterio (MCDA)  
  - sistemas expertos  
  - inteligencia artificial explicable  
  - sistemas de recomendación  
- **Desarrolladores** que quieran integrar cálculos DoC-MF o IT2MF en sus propias aplicaciones.

> [!NOTE]
> El sistema automatiza cálculos que normalmente se realizan a mano, reduce errores y permite visualizar resultados de forma inmediata.

---

### ◼️ ¿Cómo se usa?

1. El usuario puede (o no) iniciar sesión (email o Google OAuth).
2. Desde el frontend puede:
   - Crear niveles y cartas blancas  
   - Calcular funciones de valor DoC  
   - Validar funciones T1MF  
   - Construir funciones T1MF e IT2MF completas  
   - Evaluar puntos dentro de una función  
3. Cada operación puede guardarse en el **historial personal** del usuario.
4. El backend expone endpoints claros y modulares, permitiendo integrar el sistema en otros proyectos o automatizar cálculos.


---

# 🚀 1. Requisitos previos

Antes de empezar, necesitas:

- **Docker** para correr el proyecto
- **Cuenta de Google** para crear credenciales OAuth
- **Git** para clonar el repositorio

---

# 📦 2. Instalación y ejecución del proyecto

Con una terminal clona el repositorio o descarga el contenido y guárdalo en una carpeta local:

```bash
git clone https://github.com/AlexisLopez-Dev/deck-of-cards.git
cd deck-of-cards
```

Situado en la carpeta adecuada levanta los contenedores del proyecto:

```bash
docker compose up --build
```
> [!IMPORTANT] 
>Esto iniciará:
>- Backend (python) → http://localhost:8000 
>- Frontend (react) → http://localhost:5173  
>- Base de Datos (mongodb) → puerto 27017

---

# 🔌 3. Endpoints principales del proyecto

A continuación se resumen los endpoints más importantes del backend, organizados por funcionalidad.

# **Resumen de endpoints**

| Módulo | Método | Endpoint | ¿Qué hace? |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Registra un nuevo usuario y devuelve token + user_id. |
| | `POST` | `/api/auth/login` | Inicia sesión con email y contraseña. |
| | `POST` | `/api/auth/logout/{user_id}` | Cierra sesión y elimina el token del usuario. |
| | `GET` | `/api/auth/me` | Devuelve los datos del usuario autenticado. |
| **Google OAuth** | `GET` | `/api/auth/google/login` | Redirige a Google para iniciar sesión. |
| | `GET` | `/api/auth/google/callback` | Recibe el código de Google y genera el token de sesión. |
| **DoC – Función de valor** | `POST` | `/api/criteria/doc/value-function` | Calcula la función de valor DoC a partir de niveles y cartas blancas. |
| | `POST` | `/api/criteria/doc/value-function/points` | Devuelve los puntos (x,y) de la función de valor. |
| **T1MF – Validación** | `POST` | `/api/criteria/doc-mf/validate-simple` | Valida núcleo y soporte (sin nodos). |
| | `POST` | `/api/criteria/doc-mf/validate` | Valida niveles completos: núcleo, soporte y nodos. |
| **T1MF – Construcción y evaluación** | `POST` | `/api/criteria/doc-mf/build` | Construye la función de pertenencia DoC-MF. |
| | `POST` | `/api/criteria/doc-mf/evaluate` | Evalúa un punto x dentro de una función DoC-MF. |
| **IT2MF – Construcción** | `POST` | `/api/criteria/doc-it2mf/build` | Construye funciones IT2MF (lower y upper). |
| **Historial** | `POST` | `/api/history/add` | Guarda un elemento en el historial del usuario. |
| | `DELETE` | `/api/history/delete/{history_item_id}` | Elimina un elemento del historial. |


---

# 📚 4. Estructura del proyecto
```
deck-of-cards/
│
├── backend/        → API FastAPI + OAuth + MongoDB
│   ├── routers/
│   ├── models/
│   ├── utils/
│   ├── .env            → !!!
│   └── main.py
│
├── frontend/       → Vite + React
│   ├── src/
│   ├── .env            → !!!
│   └── ...
│
├── docker-compose.yaml
└── README.md
```

---

# 🔐 5. Configuración de los archivos .env

El frontend necesita un archivo `.env` para especificar el puerto del backend

📍 **Este archivo debe estar dentro de la carpeta `frontend/`**, así:

```
deck-of-cards/
│
├── frontend/ 
│   ├── src/
│   ├── .env   ← AQUÍ
│   └── ...
```

Contenido obligatorio del `.env`:

```
VITE_API_URL=http://localhost:8000/api
```

Por otro lado,

El backend necesita un archivo `.env` para funcionar correctamente, especialmente para el login con Google.

📍 **Este archivo debe estar dentro de la carpeta `backend/`**, así:

```
deck-of-cards/
│
├── backend/
│   ├── .env   ← AQUÍ
│   ├── main.py
│   ├── routers/
│   └── ...
```

Contenido obligatorio del `.env`:

```
GOOGLE_CLIENT_ID=tu_client_id_de_google      //id del cliente, debe ser el mismo del proyecto de google cloud.
GOOGLE_CLIENT_SECRET=tu_client_secret_de_google    //secreto del cliente, debe de copiarse del proyecto de google cloud cuando se crea.
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback    //url de redirección, debe ser la misma que en el proyecto de google cloud.
SECRET_KEY=superclaveultrasecreta123      //para codificación de los tokens (puedes poner cualquier texto o dejar el ejemplo que te doy).
```

> [!WARNING]
> No compartas la clave secreta del cliente.

Un ejemplo de página de donde sacar las tres primeras claves:

<img width="1902" height="835" alt="image" src="https://github.com/user-attachments/assets/6b92adf4-a36e-4e8d-acb7-ee41912125d5" />

---

# 🔑 6. Cómo crear el proyecto con su GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET

Para activar el login con Google, debes crear credenciales OAuth 2.0.
Para ello sigue estos pasos:

### 🟦 Paso 1 — Entra en Google Cloud Console  
https://console.cloud.google.com

### 🟩 Paso 2 — Crea un proyecto  
Menú superior → “Seleccionar proyecto” → “Nuevo proyecto”.

### 🟧 Paso 3 — Configura la pantalla de consentimiento OAuth

<img width="750" height="731" alt="image" src="https://github.com/user-attachments/assets/fb06952a-ddde-4a15-87f8-162b53882d00" />


En el buscador escribe: **OAuth consent screen**  ó ve a la página que se muestra en la captura superior.

Selecciona **Información de la página**: 

→ Rellena los datos necesarios (no hace falta poner un dominio si lo tienes en local) → Guardar


<img width="1398" height="470" alt="image" src="https://github.com/user-attachments/assets/d38ff3b4-5ee7-4608-ad62-515e38114392" />


### 🟨 Paso 4 — Crea las credenciales OAuth  
Menú lateral:  
**APIs & Services → Credentials → Create Credentials → OAuth Client ID**

<img width="1003" height="815" alt="image" src="https://github.com/user-attachments/assets/8a9e61fd-f4dc-4b33-aac3-3e793ceac8b3" />



Tipo de aplicación:  
✔ **Web application**

Añade en `Orígenes autorizados de javascript`:
http://localhost:8000

Añade este Redirect URI obligatorio:
http://localhost:8000/api/auth/google/callback

<img width="1911" height="847" alt="image" src="https://github.com/user-attachments/assets/c63454ac-00a5-43e3-9f53-25b4862292df" />


### 🟥 Paso 5 — Copia tus claves  
Google te mostrará:

- **Client ID**
- **Client Secret**

Pégalos en tu `.env` dentro de `backend/`. Asegúrate de que las copias correctamente.

---

# 🎉 7. Listo para usar

Con esto, ya puedes:

- Clonar el proyecto  
- Crear sus credenciales de Google  
- Configurar el ```.env```  
- Levantar el sistema con Docker  
- Usar login normal y login con Google  

Y ...

¡Proyecto listo para ejecutarse en local!

Gracias por llegar hasta aquí ;)
