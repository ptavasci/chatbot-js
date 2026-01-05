# GAIA insumos - Chatbot de Insumos de Informática

Este proyecto es un chatbot avanzado para **GAIA insumos**, una tienda de insumos de informática, construido con **Node.js**, **Express**, **LangChain** y **OpenAI** (modelo `gpt-4o-mini`). Incluye dos versiones que demuestran la evolución de un chatbot simple a un sistema más avanzado con memoria persistente y agentes inteligentes.

## 🎯 ¿Qué hace?

- **Responde preguntas sobre productos**: información, precios y características de componentes de PC, periféricos y laptops.
- **Atiende consultas frecuentes**: horarios, pagos, envíos y garantías.
- **Mantiene el contexto**: recuerda la conversación para responder preguntas de seguimiento (V2).
- **Enruta inteligentemente**: utiliza un agente evaluador para clasificar y dirigir las consultas a la fuente de datos correcta (V2).

## 🚀 Características

### ChatBot V1 - RAG Básico

- **Endpoint**: `POST /chat` | **Interfaz**: `/chatbot-v1.html`
- ✅ **RAG básico** con búsqueda semántica en ChromaDB.
- ✅ **50 productos** de informática predefinidos.
- ✅ **Sin memoria** (cada consulta es independiente).

### ChatBot V2 - Sistema de Agentes con Memoria y Herramientas (Trabajo Final)

- **Endpoint**: `POST /chatt` | **Interfaz**: `/chatbot-v2.html`
- ✅ **Memoria Persistente**: Mantiene el historial de conversación (guardado localmente en `conversation_memories`).
- ✅ **Sistema de Agentes Avanzado**:
    - 🤖 **QuestionEvaluator**: Clasifica la intención del usuario usando LLM.
    - 💻 **IT_Agent**: Agente principal potenciado por **Tools**.
    - ❓ **FrequentQuestionAgent**: Experto en información de la tienda.
- ✅ **Herramientas (Tools)**:
    - 🛠️ **it_product_search**: RAG como herramienta para buscar información de productos.
    - 🛠️ **get_product_price**: Herramienta personalizada para consultar precios exactos.
    - 🛠️ **get_current_time**: Integración simulada con un **MCP Server** de tiempo.
- ✅ **Monitoreo**: Integración completa con **LangSmith** para trazas y debugging.
- ✅ **Dos colecciones ChromaDB**: una para productos y otra para información de la tienda.

## 📂 Estructura del Proyecto

```
/
|-- conversation_memories/  # Almacena el historial de conversaciones para ChatBot V2
|-- public/                 # Archivos estáticos para la interfaz web
|   |-- chatbot-v1.html
|   |-- chatbot-v2.html
|   `-- style.css
|-- src/                    # Código fuente
|   |-- data/               # Archivos de datos (productos, información de la tienda)
|   |-- middleware/         # Middleware de Express (manejo de errores, validación)
|   |-- models/             # Modelos de datos y esquemas
|   |-- routes/             # Rutas de la API para los chatbots
|   |-- scripts/            # Scripts para poblar la base de datos
|   |-- services/           # Lógica central de la aplicación
|       |-- agents/         # Agentes de IA para ChatBot V2
|       `-- tools/          # Herramientas utilizadas por los agentes
|-- tests/                  # Tests de integración
|-- .env.example            # Plantilla de variables de entorno
|-- docker-compose.yml      # Configuración de Docker Compose
|-- Dockerfile              # Configuración de Docker para la aplicación
`-- package.json            # Dependencias y scripts del proyecto
```

## 📦 Dependencias Clave

- **Node.js**: Entorno de ejecución de JavaScript.
- **Express**: Framework web para Node.js.
- **LangChain**: Framework para desarrollar aplicaciones impulsadas por modelos de lenguaje.
- **OpenAI**: API para acceder a modelos de lenguaje grandes.
- **ChromaDB**: Base de datos vectorial para búsqueda semántica.
- **Docker**: Plataforma para desarrollar, enviar y ejecutar aplicaciones en contenedores.
- **Jest**: Framework de testing de JavaScript.

## 🛠️ Instalación y Ejecución

**Requisitos previos:**

- Docker y Docker Compose
- Node.js (para ejecución local)
- Git

**Pasos:**

1.  **Clonar el repositorio:**
    ```bash
    git clone <repository-url>
    cd ChatBot-API-JS
    ```

2.  **Configurar variables de entorno:**
    Crea un archivo llamado `.env` en la raíz del proyecto y agrega tu clave de API de OpenAI:
    ```env
    OPENAI_API_KEY="sk-..."
    ```

3.  **Elegir un método de ejecución:**

    ### Opción A: Usando Docker (Recomendada)
    Esta es la forma más fácil de comenzar, ya que no requiere instalar Node.js ni ChromaDB en tu máquina local.

    1.  **Construir e iniciar los contenedores:**
        ```bash
        docker-compose up --build
        ```
    2.  **Poblar la base de datos:**
        En una nueva terminal, ejecuta el siguiente comando para poblar la base de datos ChromaDB con la información de los productos:
        ```bash
        docker-compose run app npm run db:populate
        ```
    3.  **Acceder a la aplicación:**
        La aplicación estará disponible en `http://localhost:3001`.

    ### Opción B: Ejecución Local
    Esta opción requiere tener Node.js y Docker instalados en tu máquina local.

    1.  **Iniciar ChromaDB:**
        ```bash
        docker-compose up chroma -d
        ```
    2.  **Instalar dependencias:**
        ```bash
        npm install
        ```
    3.  **Configurar conexión a ChromaDB:**
        En tu archivo `.env`, agrega las siguientes líneas:
        ```env
        CHROMA_HOST=localhost
        CHROMA_PORT=8002
        ```
    4.  **Poblar la base de datos:**
        ```bash
        npm run db:populate
        ```
    5.  **Iniciar la aplicación:**
        ```bash
        npm start
        ```
    6.  **Acceder a la aplicación:**
        La aplicación estará disponible en `http://localhost:3001`.

## 🖥️ Interfaces Web

- **ChatBot V1**: [http://localhost:3001/chatbot-v1.html](http://localhost:3001/chatbot-v1.html)
- **ChatBot V2**: [http://localhost:3001/chatbot-v2.html](http://localhost:3001/chatbot-v2.html)

> **Nota**: El puerto por defecto es 3001. Si necesitas usar el puerto 3000, modifica `docker-compose.yml`.

## 🧪 Tests

### Ejecución Local

Para ejecutar los tests de integración localmente (requiere Node.js y ChromaDB corriendo):

```bash
npm test
```

### Ejecución con Docker

Para ejecutar los tests utilizando Docker (no requiere Node.js local):

```bash
docker-compose run app npm test
```

### Verificando el uso de Tools

Hemos agregado tests específicos para verificar que los agentes están utilizando las herramientas correctamente.

**Local:**
```bash
npm test tests/tools.test.js
```

**Docker:**
```bash
docker-compose run app npm test tests/tools.test.js
```

También puedes observar los logs en la consola del servidor. Cada vez que el agente decide usar una herramienta, verás un log como:
- `[TOOL USE] get_product_price called with: ...`
- `[TOOL USE] get_current_time called ...`
- `[TOOL USE] it_product_search called with: ...`

## 🔧 Solución de Problemas

- **Error: `Error: connect ECONNREFUSED 127.0.0.1:8002`**: Este error indica que el contenedor de ChromaDB no se está ejecutando o no es accesible. Asegúrate de haber iniciado el contenedor de ChromaDB usando `docker-compose up chroma -d` antes de ejecutar la aplicación localmente.
- **Error: `OPENAI_API_KEY not set`**: Este error significa que falta la clave de API de OpenAI. Asegúrate de haber creado un archivo `.env` en el directorio `ChatBot-API-JS` y haber agregado tu clave de API de OpenAI en él.
- **Tiempos de respuesta lentos**: El chatbot V2 a veces puede tardar en responder, especialmente en la primera consulta. Esto se debe a que el modelo de lenguaje necesita cargarse y el agente necesita decidir qué herramienta usar. Las consultas posteriores deberían ser más rápidas.
