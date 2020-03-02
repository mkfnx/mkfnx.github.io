---
layout: post
title: Ejemplo desarrollo frontend&#58; Calculadora de peso de barra olimpica.
---

Como parte de las actividades de apoyo a la comunidad de freeCodeCamp CDMX estaré publicando algunos ejemplos que sirvan como guía para realizar los proyectos necesarios para obtener las certificaciones. Este proyecto es una calculadora para el peso de una barra olímpica, el cual puede servir de guía para el proyecto [Cash Register](https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/javascript-algorithms-and-data-structures-projects/cash-register) o para otros proyectos de maquetación o frameworks de la certificación de FrontEnd de freeCodeCamp.

# Descripción del Proyecto

## Contexto y Conceptos
Las barras y los discos de peso son equipo muy común en los gimnasios, con ellos se puede crear un peso ajustable para que una persona puede cargarlo de manera cómoda y segura con el fin de ejercitarse o competir.

Hay distintos discos con diferentes pesos, los pesos más comunes tienen los siguientes valores (en libras): 2.5, 5, 10, 25, 35 y 45. Dada esta variedad de pesos, a veces ajustar nuestra barra al peso deseado puede ser un poco confuso, tardado o hasta podríamos equivocarnos (nuestros cálculos podrían no ser los mejores cáculos a mitad de una sesión intensa de gym). Es por esto que consideré interesante replicar el funcionamiento de la calculadora que me dice que discos debo colocar en la barra para configurarla con el peso que yo desee [(como la app Just Lift que uso en mi Android)](https://play.google.com/store/apps/details?id=feliform.justlift).

## Fases del Proyecto
Voy a dividir este proyecto en varias fases que puedan ayudar a ejercitar distintos aspectos del desarrollo frontend como algoritmos, maquetación, estilo y bibliotecas de código. Las fases estarán organizadas de manera que el proyecto mejore y sea más complejo poco a poco, y serán las siguientes:

1. [Algoritmo básico para calcular los discos necesarios para cierto peso (Supondremos que tenemos discos ilimitados de cada peso)]({{ site.baseurl }}/fCC-Barbell-1)
2. Visualización básica con HTML y CSS
3. Mejorar la visualización usando una biblioteca CSS
4. Algoritmo para un caso más complejo en los que ciertos discos pueden tener poca o ninguna disponibilidad.
5. Integrando una biblioteca o framework de frontend en el proyecto.

## Resultado Final

Una vez completado nuestro proyecto, tendremos algo similar a lo siguiente:

![Ejemplo de resultado de proyecto]({{ site.baseurl }}/images/barbell-calculator-example-just-lift-app.png)
-
Captura de pantalla de la [app Just Lift]((https://play.google.com/store/apps/details?id=feliform.justlift)), creada por Feliform
