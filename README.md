# <NOMBRE_PROYECTO>

## Descripción breve

++++ AQUÍ VA LA DESCRIPCIÓN ++++

## Core proyecto

- Angular 16.2.0
- PrimeNG 17.13.1
- PrimeFlex 3.3.1
- PrimeIcons 7.0.0
- FontAwesome 6.5.2
- NodeJS 18.17.1 (o última versión)
- TypeScript 5.1.3
- Sentry SDK 7.110.1

## Requisitos

- Angular https://angular.io/docs
- PrimeNG https://www.primefaces.org/primeng/
- FontAwesome https://fontawesome.com/
- PrimeFlex https://primeflex.org/
- PrimeIcons https://primeng.org/icons
- Angular CLI https://angular.io/cli
- NodeJS https://nodejs.org/es/
- Sentry SDK https://docs.sentry.io/platforms/javascript/

## Información arquitectura

Este proyecto fue generado con [Angular CLI](https://github.com/angular/angular-cli) versión 16.2.1.

Por defecto viene configurado para ser accedido mediante el uso de [Login Desarrollo DTIC](http://desarrollodtic.uv.cl/loginDesarrollo/).

Se recomienda visitar la [wiki de templates](https://github.com/dticuv/templateFrontend/wiki), para la documentación asociada.

Para ejemplos de su funcionamiento, favor visitar [Proyecto Dummy](http://desarrollodtic.uv.cl/proyectoDummy/).

## Server

### Server production

```js
npm run prod

o

ng serve --prod --host 0.0.0.0 --port XXXX
```

El sistema quedará a la escucha en la url: `http://localhost:XXXX/`.

> Debes tener consideración al manipular datos, debido a que se estará apuntando hacia ambientes de producción.

### Server development (visible)

```js
npm run dev

o

ng serve --host 0.0.0.0 --port XXXX
```

El sistema quedará a la escucha en la url: `http://localhost:XXXX/` y será visible dentro de la red que se encuentre.

### Server development (no visible)

```js
npm run start

o

npm start

o

ng serve
```

El sistema quedará a la escucha en la url: `http://localhost:4200/` y no podrá ser visible dentro de la red que se encuentre.

### Server local

```js
npm run local

o

ng serve --host 0.0.0.0 --port XXXX --configuration=local
```

El sistema quedará a la escucha en la url: `http://localhost:XXXX/`. Este modo solo funcionara si existe un "ambiente local" (`environment.local.ts`).

## Generación de vistas

Posiciónate en el directorio donde deseas crear una vista y ejecuta `ng g c component-name` para generar un nuevo componente. Esto creará en el directorio posicionado, otro directorio llamado "component-name" con lo siguiente:

- component-name
  - component-name.component.ts
  - component-name.component.html
  - component-name.component.css
  - component-name.component.spec.ts

Generar component creando un directorio: `ng g c component-name`.

Generar component dentro del mismo directorio: `ng g c component-name --flat`.

Generar modulo creando un directorio : `ng g m module-name`.

Generar modulo dentro del mismo directorio: `ng g m module-name --flat`.

Generar modulo creando un modulo + rutas : `ng g m module-name --routing`.

Generar modulo dentro del mismo directorio + rutas: `ng g m module-name --routing --flat`.

Tambien puedes utilizar: `ng generate directive|pipe|service|class|guard|interface|enum|module|interceptor`.

## Build (Deploy)

### Deploy production

```js
npm run build

o

ng build --configuration=production ---build-optimizer
```

### Deploy development

```js
npm run build-dev

o

ng build --base-href /<url-context>/ --configuration=development
```

`<url-context>` es el contexto para acceder (Ej: http://localhost/contexto). Las fuentes generadas estarán en el directorio `./dist/`.

> Asegurarse de que "<url-context>" este definida y posea el mismo nombre del directorio que contendrá el sistema.

## Comandos útiles

`npm install`, `npm install --force`

Instala las dependencias necesarias y complementarias para ejecturas el proyecto. Esto creará el directorio `./node_modules/`.

`npm uninstall XXXX`

Desinstala una dependencia XXXX.

`npm cache clean`

Borra el arbol de repositorios del npm. En caso de no poder ejecutarse, agregar el flag `--force`.

`ng new XXXX`

Crear un nuevo proyecto "XXXX", basado en la versión de Angular Cli y NodeJS instaladas en el servidor de desarrollo.
