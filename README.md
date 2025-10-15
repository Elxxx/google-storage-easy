# 🚀 @elxxx/google-storage-easy

> **Cliente simple, elegante y tipado para Google Cloud Storage**, diseñado para usarse en proyectos **Node.js y NestJS**, con soporte para **Workload Identity, keyfile JSON, subida por Buffer/archivo local, descarga, listado, obtención de metadata y más**.

---

## ✨ Características

✅ Soporta **Application Default Credentials** (GKE, Cloud Run, etc.)  
✅ Opcional: autenticación mediante **keyfile JSON o credentials inline**  
✅ Métodos listos para usar:
| Método | Descripción |
|--------|-----------|
| `upload()` | Sube archivos desde `Buffer`, `string` o ruta local |
| `download()` | Descarga a `Buffer` o guarda a disco |
| `list()` | Lista archivos con `prefix`, `delimiter`, paginación |
| `getBuffer()` | Obtiene contenido del archivo como `Buffer` |
| `getMetadata()` | Devuelve metadatos completos |

✅ Opcional para **NestJS** → `GcsModule` + `GcsService`  
✅ Totalmente escrito en **TypeScript** con **tipados explícitos**  
✅ Listo para **publicar en npm** o instalar en múltiples microservicios

---

## 📦 Instalación

```bash
npm install @elxxx/google-storage-easy @google-cloud/storage
# o
yarn add @elxxx/google-storage-easy @google-cloud/storage


🔑 Si usas Google Cloud Run, GKE con Workload Identity o Cloud Build, NO necesitas llaves.
Si usas keyfile JSON, exporta:

export GOOGLE_APPLICATION_CREDENTIALS=/ruta/service-account.json
```

## ⚙️ Autenticación soportada

```bash
 | Método                           | Recomendado para                  | Requiere JSON |
| -------------------------------- | --------------------------------- | ------------- |
| **Workload Identity (ADC)** ✅    | GKE / Cloud Run / Cloud Functions | ❌             |
| `GOOGLE_APPLICATION_CREDENTIALS` | Desarrollo local / CI pipelines   | ✅             |
| `keyFilename` en constructor     | Microservicio controlado          | ✅             |
| `credentials { email, key }`     | Inyección por Secret Manager      | ✅             |
```

## ✨ Ejemplo de uso (Node.js + TS)

```typescript
import { GcsClient } from '@elxxx/google-storage-easy';

const gcs = new GcsClient({
  projectId: 'mi-proyecto-gcp',
  defaultBucket: 'mi-bucket',
  // keyFilename: './keys/service-account.json' // opcional si usas ADC, en caso de usar, se recomienda variable como secreto o encriptada
});

async function run() {
  // Subir desde Buffer o string
  await gcs.upload({
    destination: 'docs/hola.txt',
    data: 'Hola desde Google Cloud Storage!',
    contentType: 'text/plain',
    gzip: true,
  });

  // Listar objetos
  const archivos = await gcs.list({ prefix: 'docs/' });
  console.log('Archivos:', archivos);

  // Descargar como buffer
  const buffer = await gcs.getBuffer({ key: 'docs/hola.txt' });
  console.log('Contenido:', buffer.toString());

  // Descargar a archivo local
  await gcs.download({
    source: 'docs/hola.txt',
    destinationFilePath: './downloads/hola.txt',
  });
}

run();
```

## ✨ Ejemplo de uso (NestJS)

# 1. Registrar módulo en `app.module.ts`

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { GcsModule } from '@elxxx/google-storage-easy';

@Module({
  imports: [
    GcsModule.forRoot({
      projectId: 'mi-proyecto-gcp',
      defaultBucket: 'mi-bucket',
      // keyFilename: './keys/service-account.json'
    }),
  ],
})
export class AppModule {}
```

# 2. Inyectar en un servicio

```typescript
// ejemplo.service.ts
import { Injectable } from '@nestjs/common';
import { GcsService } from '@elxxx/google-storage-easy';

@Injectable()
export class EjemploService {
  constructor(private readonly gcs: GcsService) {}

  async subirDemo() {
    return this.gcs.upload({
      destination: 'demo/archivo.txt',
      data: 'Subido con NestJS!',
      contentType: 'text/plain',
    });
  }
}
```

## 📂 Estructura recomendada

mi-proyecto/
├── src/
│   ├── main.ts
│   ├── modules/
│   └── services/
├── keys/               # opcional si usas ADC o Workload Identity
│   └── service-account.json


## 🎯 Permisos necesarios en IAM

- storage.objects.create
- storage.objects.get
- storage.objects.list
- (Opcional) storage.objects.delete
- Rol recomendado: Storage Object Admin (roles/storage.objectAdmin)

## 🔮 Próximas mejoras planeadas

| Feature                      | Estado     |
| ---------------------------- | ---------- |
| `getSignedUrl()`             | ⏳ Planeado |
| CLI `npx gcs-easy ...`       | ⏳ Planeado |
| Detección automática de MIME | ⏳ Planeado |
| Subida masiva / batch upload | ⏳ Planeado |


## 📝 Licencia — MIT

MIT License

Copyright (c) 2025
