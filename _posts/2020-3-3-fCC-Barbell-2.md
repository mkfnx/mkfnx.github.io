---
layout: post
title: Ejemplo desarrollo frontend&#58; Calculadora de pesas de gimnasio - Fase 2. Elementos HTML/CSS para visualización
---

En esta fase vamos a crear elementos HTML y CSS que servirán para crear una visualización para el resultado del problema que solucionamos en la fase anterior.

Puedes ver la segunda fase de este proyecto en este link de CodePen <https://codepen.io/mkfnx/pen/XWbgpPZ/>

# Elementos de la solución de esta fase
Para crear una visualización para nuestra calculadora de pesas vamos a usar los siguientes elementos HTML:
* Un formulario que nos permita indicar el peso que queremos calcular.
* Elementos HTML que gráficamente representen la barra y los discos. Aunque otra opción puede ser incluir gráficos o imagenes prediseñadas.
* Un título y una descripción de la página para indicar el propósito y el uso de la calculadora.

# Texto y Descripción
Lo primero que haremos será crear una estructura básica de HTML y ciertos elementos "estáticos", es decir, que no cambiaran mientras un usuario hace uso de nuestro proyecto. Estos elementos serán, el título, descripción, el formulario y estilo de elemento div de HTML que servirán para representar la barra y los discos.

```html
<h1>Barbell Plates Calculator</h1>

<p>The barbell and weight plates are used together to setup a specific weight load that can be comfortably and safely manipulated by a weightlifter in order to exercise or to compete.</p>

<p>Sometimes, loading the required and correct weight into the bar can be a little confusing, time consuming or error prone (since probably you won’t make the best calculations in the middle of a weight lifting session).</p>

<p>This helpful calculator will help you to get the plates that you need to load into the bar, letting you focus only on completing your reps ;)</p>
```

Para el título y la descripción por ahora usaremos elementos HTML sencillos (h1 y p), en las siguientes fases daremos más estilo a nuestro proyecto. Este código debemos agregarlo al panel de HTML de nuestro CodePen.

# Formulario para ingresar datos
El formulario que nos permitirá introducir el peso que queremos calcular solo tendrá un texto y un botón. Para este proyecto de prueba usaremos estos elementos "sueltos", es decir fuera de una etiqueta form, que es en donde normalmente los colocariamos y lo cual sí debemos hacer en un proyecto real ya que nos permite agregar otros comportamientos y estructurar mejor nuestra página.

```html
<input id="weightInput" type="text" />

<input id="calculateButton" type="button" value="Calculate Plates" onclick="onCalculateButtonClicked()" />
```

En los elementos del form definimos dos propiedades muy importantes:
* En el input de texto indicamos un id, ya que es así como podremos referirnos a él desde el código JavaScript y así poder obtener el valor que el usuario ingresó
* Para el botón necesitamos la propiedad onClick, la cual tendrá como valor el nombre de una función que más tarde agregaremos a nuestro código JavaScript, y la cual en este caso nombré onCalculateButtonClicked. Estas funciones en general reciben un nombre que sigue una convención que ayuda a expresar que reaccionan a un evento, por ello comienza con `on` (al ocurrir) y termina con `Clicked` (el nombre del evento, en este caso un click) y entre ellos el nombre del elemento que genera el evento (`CalculateButton`).

# Sección de Visualización
Debajo de estos elementos estará la sección en dónde colocaremos los elementos que representarán los discos y la barra, para estos usaremos divs de HTML, pero para darles la apariencia de un disco o barra usaremos CSS. Para hacer una prueba de los elementos de la visualización usaremos 3 divs fijos, pero cuando nuestro esta fase del proyecto esté completa usaremos JavaScript para crear de manera dinámica los divs necesarios para el peso indicado por un usuario. El código HTML de prueba será el siguiente:

```html
<div id="barbell">
  45
</div>
  
<div class="plate plate35">
  35
</div>

<div class="plate plate5">
  5
</div>
```
Vemos que nuestros elementos tienen las siguientes propiedades
* En el primer div que representará la barra colocaremos un id con nombre barbell, este id nos permitirá asociarle un estilo CSS a este elemento.
* Los siguientes elementos div representarán discos, y en su propiedad class asignamos los valores plate y plate35, el primero será para hacer referencia a un estilo general de todos los discos (color, borde, ancho) y el segundo será para asignar estilo particular de cada disco (altura).

A pesar de haber agregado nuestros elementos no veremos nada más que números debajo de nuestro form, esto es debido al estilo default que los divs tienen en un documento HTML, para cambiar esto y que comencemos a ver algo que parezca una barra agregaremos el siguiente código CSS en el segundo panel de nuestro CodePen.

# Código CSS

```css
#barbell {
  display: inline-block;
  background-color: #AAA;
  width: 90px;
  height: 20px;
  text-align: center;
  margin: 0 auto;
  border: 1px solid black;
}

.plate {
  display: inline-block;
  width: 20px;
  vertical-align: middle;
  border: 1px solid black;
  background-color: #F00;
}

.plate45 {
  height: 100px;
}

/* Los estilos de los otros discos solo cambian en altura */

.plate2p5 {
  height: 25px;
}
```

Después de agregar este estilo, veremos lo siguiente:

![Ejemplo de visualización de la barra olímpica]({{ site.baseurl }}/images/barbell-calculator-static-visualization.png)

En este código CSS usamos las propiedades `background-color` y `border` para hacer visible el área rectangular que ocupan todos los divs y que simularán nuestros discos y barras, asignamos un tamaño con mayor longitud para representar una barra y un tamaño con mayor altura para representar un disco. Además las propiedades `display` y `vertical-align` se usan para alinear los divs a manera que den apariencia de que los elementos que representan los discos están colocados sobre el elemento que representa la barra. También definimos una clase CSS para cada disco en particular la cual nos permitirá asignarles diferentes alturas a cada uno, dependiendo de su peso.

# Conclusión

Con esto tenemos lo necesario para pasar a la siguiente fase de proyecto en la que usaremos nuestro código JavaScript de la fase 1 para mostrar una visualización para dar respuesta al usuario usando los elementos de discos y barras que desarrollamos en esta fase.

Si tienes alguna puedes preguntarla en el [grupo de Facebook de freeCodeCamp CDMX](https://www.facebook.com/groups/free.code.camp.mexico.df/) o el [Slack de freeCodeCamp CDMX](https://join.slack.com/t/fcccdmx/shared_invite/enQtOTc5MDc3NDMxNzY2LWZiMDk2OGVmMDk2ZjkzY2JlMzQ0N2VhY2ZjYTk3NTUyYmE0MGFlNDQ1NGVkOGUzNjg3NDY0YWViN2FkMDkwOWE) o incluso contactarme a través de alguna red social de las que aparecen en el footer de este sitio.

Aquí puedes ver la [siguiente fase](https://mkfnx.github.io/fCC-Barbell-3/) de este proyecto.
