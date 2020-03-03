---
layout: post
title: Ejemplo desarrollo frontend&#58; Calculadora de pesas de gimnasio - Fase 1. Algoritmo básico.
---

En esta primera fase de nuestro proyecto de calculadora de pesas de gimnasio programaremos un algoritmo en JavaScript que resuelva un caso básico de este problema. Recordemos que este proyecto puede servir como guía para proyectos de la certificación frontend de freeCodeCamp. Y que este post es parte de una serie para crear un proyecto completo y que puedes ver completa en <https://mkfnx.github.io/fCC-Barbell//>

Puedes ver la solución de este problema en este CodePen: <https://codepen.io/mkfnx/pen/OJVgbMv/>

# Descripción Del Problema
Crea una función `getPlatesForWeight(weight)` la cual recibe el parámetro `weight` el cual es un número que indica el peso en libras que deseamos para nuestra barra olímpica. Este peso debe ser mayor de 45 lbs y debe ser un múltiplo de 5, ya que solo se pueden lograr estos pesos con los discos estándar, los cuales son de 2.5, 5, 10, 25, 35 y 45 lbs.

La función mencionada debe devolver un `Object` (o `Map`) cuyas llaves serán los pesos de los discos estándar y cuyos valores serán la cantidad de discos de cada peso que se deben cargar en cada lado de la barra, ya que el peso debe estar balanceado. Y otro punto a tomar en cuenta es que la barra pesa por si misma 45 lbs.

Algo importante dado los puntos anteriores es que el peso que de verdad debemos calcular será el peso original indicado en la función, menos las 45 lbs de la barra y esto dividio entre 2, ya que debemos balancear el peso en cada lado de la barra. Podemos resumir eso en esta fórmula:

```
Peso a calcular = (Peso Original - 45) / 2
```

Un ejemplo para tener esto un poco más claro: Al llamar a nuestra función de esta forma `getPlatesForWeight(200)`, para calcular la cantidad de discos necesarios para tener una barra de 200 lbs, la función debe devolver el siguiente map:

```javascript
{
  10: 0,
  2.5: 1,
  25: 1,
  35: 0,
  45: 1,
  5: 1
}
```

Lo cual corresponde a una barra cargada de la siguiente manera

![Ejemplo de resultado de proyecto]({{ site.baseurl }}/images/barbell-calculator-example-just-lift-app.png)
-
(Captura de pantalla de la [app Just Lift]((https://play.google.com/store/apps/details?id=feliform.justlift)), creada por Feliform)

Aquí vemos que la suma del peso para lograr una carga de 200 lbs queda de la siguiente forma:

* Peso lado izquierdo: 77.5 (1 disco de 45 + 1 disco de  25 + 1 disco de  5 + 1 disco de 2.5)
* Peso lado derecho: 77.5
* Peso barra: 45
* Total: 200 (77.5 de lado izquierdo + 77.5 de lado derecho + 45 de baarra)

## Nota: Debemos usar menor cantidad posible de discos
El mismo peso se puede ajustar de diferentes formas con los discos estándar, por ejemplo, 20 lbs pueden ser 2 discos de 10 lbs o 4 discos de 5 lbs y así con muchos otros pesos y discos, sin embargo, debido a que en los gimnasios compartimos el equipo con otras personas no queremos tardar mucho ajustando nuestra barra, así que para calcular este peso trataremos de mover el menor número posible de discos y esto tendrá como consecuencia que deberemos intentar colocar los discos más pesados primero.

# Entorno de desarrollo y creación del proyecto
Para este ejemplo usaremos [CodePen](http://codepen.io), la cual es una herramienta que nos permite editar y ejecutar nuestro código directamente del navegador. Dado que en esta fase del proyecto aún no mostraremos cosas en la vista principal del navegador, estaremos usando la consola y la instrucción `console.log` para mostrar nuestros resultados y hacer nuestras pruebas.

Para crear un proyecto en CodePen visita la dirección <https://codepen.io/pen/> ahí verás el entorno de desarrollo de CodePen (para guardar tu proyecto deberás crear una cuenta), nosotros estaremos trabajando en el 3er panel el cual tiene el título de JS. Y para poder ver los resultados de esta fase del proyecto debemos presionar el botón de abajo a la izquierda que dice Console.

![Vista de entorno de CodePen]({{ site.baseurl }}/images/code-pen-environment.png)

# Pasos de la Solución

A continuación vamos a describir los pasos y las secciones de código que permiten solucionar este problema.

Recuerda que en este enlace <https://codepen.io/mkfnx/pen/OJVgbMv/> puedes en cualquier momento puedes consultar una solución de esta fase del proyecto para obtener más contexto.

## Configuración inicial
Como primer paso, definimos valores constantes que usaremos en el proyecto para obtener un código más limpio, y así poder los llamados ["números mágicos"](https://es.wikibooks.org/wiki/Refactorizaci%C3%B3n/Reemplazar_n%C3%BAmero_m%C3%A1gico_con_constante_simb%C3%B3lica), los cuales se consideran una mala práctica.

```javascript
const PLATE_2_5 = 2.5;
const PLATE_5 = 5;
const PLATE_10 = 10;
const PLATE_25 = 25;
const PLATE_35 = 35;
const PLATE_45 = 45;
const BARBELL_WEIGHT = 45;
```

Como podemos ver, las constantes que necesitamos son simplemente los valores de los pesos de nuestros discos y de la barra.

A continuación definimos nuestra función y verificamos que se llama correctamente, colocandole un `console.log` que muestre el peso que se pasa a la función.

```javascript
function getNeededPlatesForWeight(weight) {
  console.log('weight is: ' + weight);
}

getNeededPlatesForWeight(200); // Al llamar esta función veremos en la consola un mensaje que muestra el peso con el que la invocamos
```

Inicializar el Map de discos: Nuestro Map llevará por nombre `neededPlates` y como keys tendrá los pesos de los discos, y como valor asociado a cada key, tendrá la cantidad de discos de cada peso que necesitamos para llegar al peso que deseamos.

```javascript
let neededPlates = {
      [PLATE_2_5]: 0,
      [PLATE_5]: 0,
      [PLATE_10]: 0,
      [PLATE_25]: 0,
      [PLATE_35]: 0,
      [PLATE_45]: 0
  };
```

## Validaciones

Verificar que el peso indicado es mayor que el peso de la barra (45 lbs), de no ser así, no es necesario agregar discos y por lo tanto no tenemos nada que calcular, así que devolvemos el Map de discos necesarios tal y como lo inicializamos con los valores en 0s. 

```javascript
if (weight <= BARBELL_WEIGHT) {
    console.log('lifting the empty bar is enough for that weight');
    return neededPlates;
}
```

Verificar que el peso restante (ya contando el peso de la barra) sea un múltiplo de 2.5, es decir que pueda llegarse a ese peso usando los discos estándar, de no ser así, devolvemos el Map de discos necesarios tal y como lo inicializamos con los valores en 0s.

```javascript
let weightPerSide = (weight - BARBELL_WEIGHT) / 2;

if (weightPerSide % PLATE_2_5 !== 0) {
    console.log('The requested weight can\'t be exactly loaded with the standard weight plates');
    return neededPlates;
}
```

## Procedimiento principal.
Agregamos discos, empezando por el de mayor peso, hasta que logremos el peso deseado y finalmente devolvemos el nuestro resultado, un Map con la cantidad de discos correspondiente.

Para lograr esto usamos un while con una condición que verifica que aún haya discos por agregar, esto es que al menos podamos agregar 1 disco de 2.5 (el más pequeño). Y también notemos que cada que agregamos un disco al map, también restamos el peso del disco agregado del peso que deseamos lograr y de esta manera es como lograremos detenern el ciclo cuando lleguemos al peso objetivo.

```javascript
while (weightPerSide >= PLATE_2_5) {
    if (weightPerSide >= PLATE_45) {
        neededPlates[PLATE_45] += 1;
        weightPerSide -= PLATE_45;
    } else if (weightPerSide >= PLATE_35) {
        neededPlates[PLATE_35] += 1;
        weightPerSide -= PLATE_35;
    } else if (weightPerSide >= PLATE_25) {
        neededPlates[PLATE_25] += 1;
        weightPerSide -= PLATE_25;
    } else if (weightPerSide >= PLATE_10) {
        neededPlates[PLATE_10] += 1;
        weightPerSide -= PLATE_10;
    } else if (weightPerSide >= PLATE_5) {
        neededPlates[PLATE_5] += 1;
        weightPerSide -= PLATE_5;
    } else if (weightPerSide >= PLATE_2_5) {
        neededPlates[PLATE_2_5] += 1;
        weightPerSide -= PLATE_2_5;
    }
}

console.log('Weight sucessfully loaded');
return neededPlates;
```

## Pruebas y Depuración
Probemos llamar a nuestra función con distintos valores que nos ayuden a verificar que se comporta de manera correcta en varios escenarios, por ejemplo, pasando valores menores al peso de 45 lbs de la barra y pasando distintos valores válidos y verificando que la suma del peso de los discos (de ambos lados) y del peso de la barra sea correcta.

Podemos usar un depurador o debugger para analizar de manera más detallada la ejecución de nuestro código en cualquier sección en la que tengamos dudas, sin embargo me parece que CodePen no es la opción más cómoda para depurar, así que para esto recomiendo usar otra herramienta, como Visual Studio Code o WebStorm.

## Separar el código en funciones para mantenerlo limpio.

Nuestro proyecto funciona correctamente para el caso que describimos, sin embargo, se pueden realizar mejoras de estilo al código que nos ayudarán a hacer el código más entendible y hacerlo más fácil de modificar en el futuro o por otros compañeros de equipo.

Una técnica muy simple y efectiva para mejorar la legibilidad del código es la de separarla en pequeñas funciones que realicen un propósito específico dentro de nuestro programa. Cuando creamos una nueva función de cierta manera creamos una etiqueta que describe cierto proceso o sección particular del programa, por lo tanto al tener varias funciones podemos sustituir bloques grandes de código por funciones que describan una función y al combinarlas obtendremos código que será muy similar a leer un texto normal.

En este caso podemos usar las secciones indicadas en este texto para identificar funciones, de manera que tendremos una función para inicializar un map, funciones para realizar validaciones y una función para realizar nuestro proceso principal (colocar discos en la barra). Al crear estas funciones y combinarlas obtendremos un programa, y en particular un bloque principal más legible, el cual se verá así.

```javascript
function getNeededPlatesForWeight(weight) {
    console.log('weight is: ' + weight);
    let neededPlates = initStandardWeightPlateSet(); // Función para inicializar
    let neededPlateWeight = weight - BARBELL_WEIGHT;

    if (!isNeededPlateWeightValid(neededPlateWeight)) { // Fución para validaciones
        return [];
    }

    let neededWeightBySide = neededPlateWeight / 2;
    calculateNeededPlatesBySide(neededPlates, neededWeightBySide); // Función para agregar peso a la barra

    console.log('Load the following plates in each side of the bar: ');
    return neededPlates;
}
```

**El código completo de el programa dividido en funciones lo podemos ver en este otro CodePen <https://codepen.io/mkfnx/pen/ZEGyLMX/>**

## Conclusión de esta fase

Pudimos ver como resolver un algoritmo básico con JavaScript para un problema real, para el que incluso existen apps en tiendas que lo solucionan y los cuales son similares a proyectos necesarios para la certificación de freeCodeCamp.

Hicimos una rápida revisión de herramientas útiles para crear y analizar nuestros proyectos.

Analizamos este problema dividiendolo en distintas secciones con un propósito específico como inicialización, validación y problema principal. 

También hicimos algunas observaciones sobre la importancia del estilo del código y vimos como al dividirlo en funciones podemos hacerlo más fácil de leer.

## Nota final

La definición del problema puede ser algo confusa, debido principalmente a como se distribuye el peso de la barra (peso por cada lado y peso de la barra misma), así que si tienes alguna puedes preguntarla en el [grupo de Facebook de freeCodeCamp CDMX](https://www.facebook.com/groups/free.code.camp.mexico.df/) o el [Slack de freeCodeCamp CDMX](https://join.slack.com/t/fcccdmx/shared_invite/enQtOTc5MDc3NDMxNzY2LWZiMDk2OGVmMDk2ZjkzY2JlMzQ0N2VhY2ZjYTk3NTUyYmE0MGFlNDQ1NGVkOGUzNjg3NDY0YWViN2FkMDkwOWE) o incluso contactarme a través de alguna red social de las que aparecen en el footer de este sitio.

**Puedes ver la siguiente fase de este proyecto en <https://mkfnx.github.io/fCC-Barbell-2/>**