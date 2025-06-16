---
layout: post
title: Ejemplo desarrollo frontend&#58; Calculadora de pesas de gimnasio - Fase 3. Visualización Dinámica
---

También necesitaremos el siguiente código JavaScript
* Incluiremos el código de la fase anterior como un script reutilizable en nuestra página.
* Crearemos nuevo código que nos permita reaccionar a las acciones del usuario en nuestra página y ejecutar nuestro código de la fase anterior.

# Código JavaScript

## Importar Script

Lo primero que necesitamos es incluir nuestro script de la etapa anterior, esto podemos hacerlo desde el menu Settings que está en la barra superior del entorno de CodePen, un poco a la derecha. Dentro de este menú de Settings seleccinamos la opción JS y en uno de los últimos campos de texto que aparecen en esa sección colocamos [la url de nuestro CodePen anterior](https://codepen.io/mkfnx/pen/ZEGyLMX/) que contiene el algoritmo básico para calcular los discos necesarios en la barra. Finalmente presionamos el boton Save & Close.

Podemos comprobar que nuestro script fue correctamente cargado llamando una de las funciones que contiene, es decir escribimos el código `getNeededPlatesForWeight(200);` y en la consola  debemos ver un resultado como el de la fase anterior.

## Reaccionar a eventos de usuario
Después vamos a definir la función on `onCalculateButtonClicked()` que definimos en la parte anterior y la cual se ejecutará cuándo presionemos el botón de nuestro from debido a que se asignó como valor de la propiedad `onClick` de nuestro botón. Para comprobar que funciona correctamente, agregaremos una línea simple de código que muestre un mensaje de alerta de prueba.

```javascript
function onCalculateButtonClicked() {
    alert('calculate button clicked');
}
```
## Obtener valores introducidos por el usuario
Lo siguiente será obtener el valor que el usuario ingreso en el form, para esto primero necesitamos obtener una referencia al input de texto que permite al usuario ingresar el valor, esto lo hacemos con la función `getElementById` del objeto document, con el parámetro `weightInput` que fue el que definimos en la fase anterior. Una vez que tenemos una referencia al input, el valor capturado por el usuario lo podemos obtener accediendo a la propiedad `value`.

Para comprobar que accedemos correctamente al valor del input de texto vamos a mostrarlo en el mensaje de alerta de prueba que tenemos.

```javascript
function onCalculateButtonClicked() {
    let weightInput = document.getElementById("weightInput").value;
    alert('Calculate plates for weight: ' + weightInput);
}
```

## Verificación de datos
Un detalle importante es que el valor que obtenemos del input de texto es precisamente tipo texto o string, pero debido a que nosotros vamos a usar este valor para hacer cálculos matemáticos, entonces tenemos que hacer una conversión de tipos, esto lo hacemos con la instrucción `parseInt(weightInput)` y asignaremos el resultado a una nueva variable llamada weight. Otra cosa a tomar en cuenta es que nunca podemos confiar completamente en los valores que los usuarios ingresan a la aplicación, debido a que podrían ingresar información incorrecta de manera intencional o por alguna confusión, por lo tanto una verificación adicional que haremos será validar que la conversión de string a número entero haya sido exitosa, esto lo hacemos con la instrucción `isNaN(weight)` y basados en el resultado sabremos si podemos continuar o no con nuestro proceso, y para comprobarlo, mostramos el mensaje de alerta correspondiente para cada caso.

```javascript
function onCalculateButtonClicked() {
    let weightInput = document.getElementById("weightInput").value;
    let weight = parseInt(weightInput);
    
    if (isNaN(weight)) {
        alert('Provide a valid number');
        return;
    }

    alert('calculate plates for the valid weight: ' + weight);
}
```

## Ejecutar solución con el valor indicado por el usuario
Ahora que tenemos un dato válido proporcionado por el usuario, podemos realizar el cálculo para ese valor usando el script desarrollado en las fases anteriores. Esto lo hacemos con la instrucción `getNeededPlatesForWeight(weight)` y asignamos el valor en una nueva variable llamada `neededPlates`. Si intentamos mostrar el resultado al usuario usando un mensaje de alerta como lo veníamos haciendo veremos que esto no es muy útil debido a que solo se mostrará un texto, además la representación en texto no es la mejor para este caso, en cambio, podemos crear una mucho mejor visualización usando los elemento HTML desarrollados en la fase anterior.

```javascript
function onCalculateButtonClicked() {
    let weightInput = document.getElementById("weightInput").value;
    let weight = parseInt(weightInput);
    
    if (isNaN(weight)) {
        alert('Provide a valid number');
        return;
    }

    let neededPlates = getNeededPlatesForWeight(weight);
}
```

## Creando y agregando un disco
Esta será la parte central y más extensa de esta fase, lo que haremos aquí será usar el resultado de tipo Object que nos devuelve la función `getNeededPlatesForWeight` de nuestro script importado, y a partir de ese valor creamos de manera dinámica los elementos HTML que necesitemos. Esto lo haremos dentro de una nueva función que llamaremos 'addPlatesToView(neededPlates)' y que como vemos recibe como parámetro el Object que contiene los discos de cada peso que necesitamos.

Antes de llegar a la solución real, agregaremos una cantidad definida de discos de cada peso, para ejemplificar el proceso para crear cada disco. De acuerdo a nuestro desarrollo de la fase anterior, definimos nuestros elementos HTML que representan los discos y la barra como elementos div con un estilo en particular usando una class de CSS diferente cada disco de cada peso. Entonces, la creación de un disco necesita dos pasos:

1. Crear elemento div. Esto hacemos con la instrucción `document.createElement('div')` y guardamos el elemento en una variable.

2. Agregar clases correspondientes. Lo hacemos con la función `setAttribute` pasando como primer parametro la palabra class ya que queremos agregar el atributo class y como segundo parámetro el nombre de la clase que queremos, Así que por ejemplo para crear un disco de 45 la instrucción será `plateDiv.setAttribute('class', 'plate plate45')`

Y finalmente para agregar el elemento creado a nuestro HTML usaemos la instrucción `document.body.appendChild(plateDiv)`. Algo importante a notar aquí, es que estamos agregando los elementos al elemento principal o raíz de nuestro HTML (document) debido a que nuestro documento es muy sencillo, sin embargo, en muchas ocasiones tratamos con documentos más complejos con varias secciones y probablemente tengamos que ser más específicos con la sección en la que agregaremos nuestros elementos y probablemente debamos agregar elementos o modificar varias secciones.

```javascript
function addPlatesToView(neededPlates) {
    // Crear y agregar un disco de 45 lbs
    let plateDiv = document.createElement('div');
    plateDiv.setAttribute('class', 'plate plate45');
    document.body.appendChild(plateDiv);

    // Crear y agregar un disco de 25 lbs
    let plateDiv = document.createElement('div');
    plateDiv.setAttribute('class', 'plate plate25');
    document.body.appendChild(plateDiv);

    // Crear y agregar cualquier otro disco que queramos
    // ...
}
```

Para que al presionar el botón de nuestro form se ejecute nuestra función que agrega los discos la función `onCalculateButtonClicked` se verá así:

```javascript
function onCalculateButtonClicked() {
    let weightInput = document.getElementById("weightInput").value;
    let weight = parseInt(weightInput);
    
    if (isNaN(weight)) {
        alert('Provide a valid number');
        return;
    }

    let neededPlates = getNeededPlatesForWeight(weight);
    addPlatesToView(neededPlates);
}
```

## Crear un disco dinámicamente
El siguiente paso será parametrizar la creación de los elementos, esto es, que podamos crear el disco correspondiente simplemente indicando el valor del peso del disco que necesitamos. Para hacer eso crearemos una nueva función llamada `createPlateViewsForWeight(currentPlateWeight)` que reciba el peso que indica el disco que crearemos. Veremos que el código es muy similar a nuestro paso anterior, sin embargo ahora creamos de manera dinámica la clase mediante una concatenación de strings, es decir usar la string `plate` que es un prefijo común a todos los discos y a ello agregarle el valor del peso que se recibe en la función y así crear el nombre de la clase que necesitamos.

```javascript
function createPlateViewForWeight(currentPlateWeight) {
    let plateDiv = document.createElement('div');
    plateDiv.textContent = weight.toString();
    plateDiv.setAttribute('class', 'plate plate' + weight);
    document.body.appendChild(plateDiv);
}
```

Sin embargo esto solo agrega un solo disco a la barra, pero podríamos necesitar agregar más de un disco así que colocaremos este código dentro de un ciclo para poder agregar varios y recibiremos como parámetro la cantidad de discos a crear. Nuestra función quedará así:

```javascript
function createPlateViewsForWeight(weight, quantity) {
  for (let index = 0; index < quantity; index++) {
    let plateDiv = document.createElement('div');
    plateDiv.textContent = weight.toString();
    plateDiv.setAttribute('class', 'plate plate' + weight);
    document.body.appendChild(plateDiv);
  }
}
```

## Crear los discos indicados por la solución de nuestro script
Ahora que podemos agregar varios discos de un peso, para lograr la visualización final solo necesitaremos una instrucción para agregar discos de diferente peso. Para esto actualizaremos la función `addPlatesToView(neededPlates)` con un ciclo que recorre el Object resultado que contiene los discos y llama a la función `createPlateViewsForWeight(weight, quantity)` para agregar discos de cada peso.

```javascript
function addPlatesToView(neededPlates) {
  for (let index = 0; index < PLATE_WEIGHTS_DESC.length; index++) {
    const currentPlateWeight = PLATE_WEIGHTS_DESC[index];
    let currentPlateQty = neededPlates[currentPlateWeight];
    createPlateViewsForWeight(currentPlateWeight, currentPlateQty);
  }
}
```

`PLATE_WEIGHTS_DESC` fue definida en nuestro script de la solución y contiene todos los pesos posibles de nuestros discos, así que lo usaremos para poder ejecutar la función para crear discos de cada peso. Y para obtener la cantidad de discos de cada peso usamos la instrucción `neededPlates[currentPlateWeight]` que permite obtener el valor para la key especificada, y esta key representa un peso específico en cada iteración del ciclo.

## Verificación solución válida
Antes de proceder crear discos debemos verificar que la solución de verdad haya sido posible (recordemos que en la fase 1 definimos algunos casos en los que la solución no era posible), de no ser así no tiene caso continuar ya que no será necesario agregar ningún disco.

## Limpiar resultados de soluciones anteriores.
Si ejecutamos varias veces el script, veremos que los discos se continuan agregando al documento HTML uno después de otro, por lo tanto necesitaremos una función para borrar los discos agregados en soluciones anteriores.

```javascript
function removePreviousPlateViews() {
  let previousPlates = document.getElementsByClassName('plate');
  console.log('previous plates length: ' + previousPlates.length);
  for (let index=previousPlates.length-1; index>=0; index--) {
    const element = previousPlates[index];
    console.log("Removing item: " + element);
    element.parentNode.removeChild(element);
  }
}
```

## Conclusiones

Puedes ver el código de la solución completa en Codpen <https://codepen.io/mkfnx/pen/XWbgpPZ/>
